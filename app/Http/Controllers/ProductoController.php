<?php

namespace App\Http\Controllers;

use App\Http\Requests\Productos\ProductoStoreRequest;
use App\Http\Requests\Productos\ProductoUpdateRequest;
use App\Http\Resources\ProductoResource;
use App\Http\Resources\MarcaResource;
use App\Http\Resources\CategoriaResource;
use App\Models\Producto;
use App\Models\ProductoMedia;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ProductoController extends Controller {

    public function index(Request $request): Response {
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status');
        $marcaId = $request->get('marca_id');
        $categoriaId = $request->get('categoria_id');

        $normalizeAll = function ($v) {
            $v = is_string($v) ? trim($v) : $v;
            if ($v === '' || $v === null) return null;
            if ($v === '__ALL__' || $v === '__all__') return null;
            return $v;
        };

        $status = $normalizeAll($status);
        $marcaId = $normalizeAll($marcaId);
        $categoriaId = $normalizeAll($categoriaId);

        $rawPerPage = $request->get('per_page', 15);
        $perPage = is_numeric($rawPerPage) ? (int) $rawPerPage : 15;

        $allowedPerPage = [10, 15, 20, 30, 50, 100, 0];
        if (!in_array($perPage, $allowedPerPage, true)) $perPage = 15;

        $query = Producto::query()
            ->with(['marca', 'categoria', 'medias'])
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($w) use ($q) {
                    $w->where('sku', 'like', "%{$q}%")
                      ->orWhere('nombre', 'like', "%{$q}%");
                });
            })
            ->when($status, fn ($qr) => $qr->where('status', $status))
            ->when($marcaId, fn ($qr) => $qr->where('marca_id', $marcaId))
            ->when($categoriaId, fn ($qr) => $qr->where('categoria_id', $categoriaId))
            ->orderByDesc('id');

        $productosPaginator = $perPage === 0
            ? new \Illuminate\Pagination\LengthAwarePaginator(
                ($items = $query->get()),
                $items->count(),
                max($items->count(), 1),
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            )
            : $query->paginate($perPage)->withQueryString();

        $marcas = Marca::query()->where('status', 'activo')->orderBy('nombre')->get();
        $categorias = Categoria::query()
            ->where('tipo', 'PRODUCTO')
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Productos/Index', [
            'items' => ProductoResource::collection($productosPaginator),
            'filters' => [
                'q' => $q,
                'status' => $status ?? '__ALL__',
                'marca_id' => $marcaId ?? '__ALL__',
                'categoria_id' => $categoriaId ?? '__ALL__',
                'per_page' => $perPage,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    public function store(ProductoStoreRequest $request) {
        $data = $request->validated();
        $fotoPrincipal = $request->file('foto_principal');
        $fotos = $request->file('fotos', []);
        unset($data['foto_principal'], $data['fotos']);

        $uid = auth()->id();

        $producto = DB::transaction(function () use ($data, $uid, $fotoPrincipal, $fotos) {
            $producto = Producto::create([
                ...$data,
                'created_by' => $uid,
                'updated_by' => $uid,
            ]);

            if ($fotoPrincipal) $this->attachImage($producto, $fotoPrincipal, true);

            if (is_array($fotos) && count($fotos)) {
                foreach ($fotos as $file) $this->attachImage($producto, $file, false);
            }

            $this->ensureHasMainMedia($producto);

            return $producto->load(['marca', 'categoria', 'medias']);
        });

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'producto' => new ProductoResource($producto),
            ], SymfonyResponse::HTTP_CREATED);
        }

        return redirect()->route('productos.index')->with('success', 'Producto creado correctamente.');
    }

    public function update(ProductoUpdateRequest $request, Producto $producto) {
        $data = $request->validated();
        $fotoPrincipal = $request->file('foto_principal');
        $fotos = $request->file('fotos', []);
        unset($data['foto_principal'], $data['fotos']);

        $uid = auth()->id();

        DB::transaction(function () use ($producto, $data, $uid, $fotoPrincipal, $fotos) {
            $producto->update([
                ...$data,
                'updated_by' => $uid,
            ]);

            if ($fotoPrincipal) {
                ProductoMedia::where('producto_id', $producto->id)->update(['principal' => false]);
                $this->attachImage($producto, $fotoPrincipal, true);
            }

            if (is_array($fotos) && count($fotos)) {
                foreach ($fotos as $file) $this->attachImage($producto, $file, false);
            }

            $this->ensureHasMainMedia($producto);
        });

        $producto->load(['marca', 'categoria', 'medias']);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'producto' => new ProductoResource($producto),
            ]);
        }

        return redirect()->route('productos.index')->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Request $request, Producto $producto) {
        $producto->update([
            'status' => 'inactivo',
            'deleted_by' => auth()->id(),
        ]);

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Producto desactivado.');
    }

    public function toggleStatus(Request $request, Producto $producto) {
        $producto->status = $producto->status === 'activo' ? 'inactivo' : 'activo';
        $producto->save();

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'status' => $producto->status]);
        }

        return response()->noContent();
    }

    public function mediaUpload(Request $request, Producto $producto) {
        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $created = DB::transaction(function () use ($request, $producto) {
            $newRows = [];
            foreach ($request->file('files') as $file) {
                $makeMain = !ProductoMedia::where('producto_id', $producto->id)
                    ->where('status', 'activo')
                    ->where('principal', true)
                    ->exists();

                $newRows[] = $this->attachImage($producto, $file, $makeMain);
            }

            $this->ensureHasMainMedia($producto);
            return $newRows;
        });

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Imágenes subidas correctamente',
                'files' => $created,
            ]);
        }

        return redirect()->back()->with('success', 'Imágenes subidas correctamente.');
    }

    public function mediaUpdateOrder(Request $request, Producto $producto) {
        $request->validate([
            'ordenes' => 'required|array|min:1',
            'ordenes.*.id' => 'required|integer|exists:producto_medias,id',
            'ordenes.*.orden' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request, $producto) {
            foreach ($request->ordenes as $item) {
                ProductoMedia::where('id', $item['id'])
                    ->where('producto_id', $producto->id)
                    ->update(['orden' => (int) $item['orden']]);
            }
        });

        if ($request->expectsJson()) return response()->json(['success' => true]);

        return redirect()->back()->with('success', 'Orden actualizado.');
    }

    public function mediaSetMain(Request $request, Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            if ($request->expectsJson()) {
                return response()->json(
                    ['success' => false, 'message' => 'Media inválida'],
                    SymfonyResponse::HTTP_BAD_REQUEST
                );
            }
            return redirect()->back()->with('error', 'Media inválida para este producto.');
        }

        DB::transaction(function () use ($producto, $media) {
            ProductoMedia::where('producto_id', $producto->id)->update(['principal' => false]);
            $media->update(['principal' => true, 'status' => 'activo']);
        });

        if ($request->expectsJson()) return response()->json(['success' => true]);

        return redirect()->back()->with('success', 'Imagen principal actualizada.');
    }

    public function mediaUpdate(Request $request, Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            if ($request->expectsJson()) {
                return response()->json(
                    ['success' => false, 'message' => 'Media inválida'],
                    SymfonyResponse::HTTP_BAD_REQUEST
                );
            }
            return redirect()->back()->with('error', 'Media inválida para este producto.');
        }

        $request->validate([
            'orden' => 'sometimes|integer|min:1',
            'tipo' => 'sometimes|in:imagen,video',
            'principal' => 'sometimes|boolean',
            'status' => 'sometimes|in:activo,inactivo',
        ]);

        DB::transaction(function () use ($request, $producto, $media) {
            if ($request->has('principal') && $request->boolean('principal') === true) {
                ProductoMedia::where('producto_id', $producto->id)->update(['principal' => false]);
            }
            $media->update($request->only(['orden', 'tipo', 'principal', 'status']));
            $this->ensureHasMainMedia($producto);
        });

        if ($request->expectsJson()) return response()->json(['success' => true]);

        return redirect()->back()->with('success', 'Media actualizada.');
    }

    public function mediaDestroy(Request $request, Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            if ($request->expectsJson()) {
                return response()->json(
                    ['success' => false, 'message' => 'Media inválida'],
                    SymfonyResponse::HTTP_BAD_REQUEST
                );
            }
            return redirect()->back()->with('error', 'Media inválida para este producto.');
        }

        DB::transaction(function () use ($producto, $media) {
            $wasMain = (bool) $media->principal;
            $media->update(['status' => 'inactivo', 'principal' => false]);
            if ($wasMain) $this->ensureHasMainMedia($producto);
        });

        if ($request->expectsJson()) return response()->json(['success' => true]);

        return redirect()->back()->with('success', 'Media desactivada.');
    }

    private function attachImage(Producto $producto, \Illuminate\Http\UploadedFile $file, bool $makeMain): ProductoMedia {
        $lastOrder = (int) (ProductoMedia::where('producto_id', $producto->id)->max('orden') ?? 0);
        $path = $file->store("productos/{$producto->id}", 'public');

        return ProductoMedia::create([
            'producto_id' => $producto->id,
            'tipo' => 'imagen',
            'url' => $path,
            'orden' => $lastOrder + 1,
            'principal' => $makeMain,
            'status' => 'activo',
        ]);
    }

    private function ensureHasMainMedia(Producto $producto): void {
        $hasMain = ProductoMedia::where('producto_id', $producto->id)
            ->where('status', 'activo')
            ->where('principal', true)
            ->exists();

        if ($hasMain) return;

        $first = ProductoMedia::where('producto_id', $producto->id)
            ->where('status', 'activo')
            ->orderBy('orden')
            ->first();

        if ($first) $first->update(['principal' => true]);
    }
    
}
