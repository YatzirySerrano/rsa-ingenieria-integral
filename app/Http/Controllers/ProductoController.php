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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ProductoController extends Controller {

    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));

        // Normaliza filtros (si llega "__ALL__" o vacío, lo tratamos como null)
        $status = $request->get('status');
        $marcaId = $request->get('marca_id');
        $categoriaId = $request->get('categoria_id');

        $normalizeAll = function ($v) {
            $v = is_string($v) ? trim($v) : $v;
            if ($v === '' || $v === null) return null;
            if ($v === '__ALL__') return null;
            return $v;
        };

        $status = $normalizeAll($status);
        $marcaId = $normalizeAll($marcaId);
        $categoriaId = $normalizeAll($categoriaId);

        // per_page: allowlist + soporte para 0 = "Todos"
        $rawPerPage = $request->get('per_page', 15);
        $perPage = is_numeric($rawPerPage) ? (int) $rawPerPage : 15;

        $allowedPerPage = [10, 15, 20, 30, 50, 100, 0]; // ajusta a tu UI
        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 15;
        }

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

        // Si per_page = 0 => "Todos": no paginar
        if ($perPage === 0) {
            $productos = $query->get();

            // Si NO quieres tocar tu componente, esto evita que reviente:
            // Creamos un paginator "fake" de 1 página.
            $productosPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
                $productos,
                $productos->count(),
                $productos->count() > 0 ? $productos->count() : 1,
                1,
                [
                    'path' => $request->url(),
                    'query' => $request->query(),
                ]
            );
        } else {
            $productosPaginator = $query->paginate($perPage)->withQueryString();
        }

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
                'per_page' => $perPage, // clave para que el front lo refleje siempre
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    public function create(): Response {
        $marcas = Marca::query()->where('status', 'activo')->orderBy('nombre')->get();
        $categorias = Categoria::query()
            ->where('tipo', 'PRODUCTO')
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get();
        return Inertia::render('Productos/Create', [
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    public function store(ProductoStoreRequest $request) {
        $data = $request->validated();

        Producto::create([
            ...$data,
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);
        return redirect()
            ->route('productos.index')
            ->with('success', 'Producto creado correctamente.');
    }

    public function edit(Producto $producto): Response {
        $marcas = Marca::query()->where('status', 'activo')->orderBy('nombre')->get();
        $categorias = Categoria::query()
            ->where('tipo', 'PRODUCTO')
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get();
        $producto->load(['marca', 'categoria', 'medias']);
        return Inertia::render('Productos/Edit', [
            'item' => new ProductoResource($producto),
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
                'media_tipos' => ['imagen', 'video'],
            ],
        ]);
    }

    public function update(ProductoUpdateRequest $request, Producto $producto) {
        $data = $request->validated();
        $producto->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);
        return redirect()
            ->route('productos.index')
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Producto $producto) {
        $producto->update([
            'status' => 'inactivo',
            'deleted_by' => auth()->id(),
        ]);
        return redirect()
            ->back()
            ->with('success', 'Producto desactivado.');
    }

    // Subir múltiples imágenes para un producto (web + inertia friendly)
    public function mediaUpload(Request $request, Producto $producto) {
        $request->validate([
            'files' => 'required|array|min:1',
            'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);
        $created = DB::transaction(function () use ($request, $producto) {
            $lastOrder = (int) (ProductoMedia::where('producto_id', $producto->id)->max('orden') ?? 0);
            $newRows = [];
            foreach ($request->file('files') as $file) {
                $lastOrder++;
                $path = $file->store("productos/{$producto->id}", 'public');

                $newRows[] = ProductoMedia::create([
                    'producto_id' => $producto->id,
                    'tipo' => 'imagen',
                    'url' => $path,
                    'orden' => $lastOrder,
                    'principal' => false,
                    'status' => 'activo',
                ]);
            }
            return $newRows;
        });
        // Respuesta híbrida: JSON si es XHR/AJAX, redirect si es Inertia visit.
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Imágenes subidas correctamente',
                'files' => $created,
            ]);
        }
        return redirect()
            ->back()
            ->with('success', 'Imágenes subidas correctamente.');
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
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }
        return redirect()->back()->with('success', 'Orden actualizado.');
    }

    public function mediaSetMain(Request $request, Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Media inválida'], SymfonyResponse::HTTP_BAD_REQUEST);
            }
            return redirect()->back()->with('error', 'Media inválida para este producto.');
        }
        DB::transaction(function () use ($producto, $media) {
            ProductoMedia::where('producto_id', $producto->id)->update(['principal' => false]);
            $media->update(['principal' => true]);
        });
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }
        return redirect()->back()->with('success', 'Imagen principal actualizada.');
    }

    public function mediaUpdate(Request $request, Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Media inválida'], SymfonyResponse::HTTP_BAD_REQUEST);
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
            // Si quieren setear principal por aquí, garantizamos unicidad
            if ($request->has('principal') && (bool) $request->boolean('principal') === true) {
                ProductoMedia::where('producto_id', $producto->id)->update(['principal' => false]);
            }
            $media->update($request->only(['orden', 'tipo', 'principal', 'status']));
        });
        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Media actualizada.');
    }

    public function mediaDestroy(Request $request, Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Media inválida'], SymfonyResponse::HTTP_BAD_REQUEST);
            }
            return redirect()->back()->with('error', 'Media inválida para este producto.');
        }
        // Opción: eliminar archivo físico si lo necesitas:
        // Storage::disk('public')->delete($media->url);
        $media->update(['status' => 'inactivo', 'principal' => false]);

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Media desactivada.');
    }

}
