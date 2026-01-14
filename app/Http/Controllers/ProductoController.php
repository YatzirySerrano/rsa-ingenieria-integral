<?php

namespace App\Http\Controllers;

use App\Http\Requests\Productos\ProductoStoreRequest;
use App\Http\Requests\Productos\ProductoUpdateRequest;
use App\Http\Requests\Productos\ProductoMediaStoreRequest;
use App\Http\Resources\ProductoResource;
use App\Http\Resources\MarcaResource;
use App\Http\Resources\CategoriaResource;
use App\Http\Resources\ProductoMediaResource;
use App\Models\Producto;
use App\Models\ProductoMedia;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller {

    // Listado principal de productos con filtros y catálogos para selects.
    public function index(Request $request): Response {
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status');
        $marcaId = $request->get('marca_id');
        $categoriaId = $request->get('categoria_id');
        $productos = Producto::query()
            ->with(['marca', 'categoria'])
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($w) use ($q) {
                    $w->where('sku', 'like', "%{$q}%")
                    ->orWhere('nombre', 'like', "%{$q}%");
                });
            })
            ->when($status, fn($qr) => $qr->where('status', $status))
            ->when($marcaId, fn($qr) => $qr->where('marca_id', $marcaId))
            ->when($categoriaId, fn($qr) => $qr->where('categoria_id', $categoriaId))
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();
        // Catálogos: solo categorías tipo PRODUCTO.
        $marcas = Marca::query()->orderBy('nombre')->get();
        $categorias = Categoria::query()->where('tipo', 'PRODUCTO')->orderBy('nombre')->get();
        return Inertia::render('Productos/Index', [
            'items' => ProductoResource::collection($productos),
            'filters' => [
                'q' => $q,
                'status' => $status,
                'marca_id' => $marcaId,
                'categoria_id' => $categoriaId,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    // Pantalla de alta (si se usa página Create).
    public function create(): Response {
        $marcas = Marca::query()->orderBy('nombre')->get();
        $categorias = Categoria::query()->where('tipo', 'PRODUCTO')->orderBy('nombre')->get();
        return Inertia::render('Productos/Create', [
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    // Alta: registra y regresa a index.
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

    // Pantalla de edición (si existe Edit como página).
    public function edit(Producto $producto): Response {
        $marcas = Marca::query()->orderBy('nombre')->get();
        $categorias = Categoria::query()->where('tipo', 'PRODUCTO')->orderBy('nombre')->get();
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

    // Edición: actualiza y regresa a index.
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

    // Eliminación lógica.
    public function destroy(Producto $producto) {
        $producto->update([
            'status' => 'inactivo',
            'deleted_by' => auth()->id(),
        ]);
        return redirect()
            ->back()
            ->with('success', 'Producto desactivado.');
    }

    // Agrega una media al producto (foto/video) y respeta "principal".
    public function mediaStore(ProductoMediaStoreRequest $request, Producto $producto) {
        $data = $request->validated();
        // Si se marca principal, se apaga principal en las demás.
        if (!empty($data['principal'])) {
            ProductoMedia::query()
                ->where('producto_id', $producto->id)
                ->update(['principal' => false]);
        }
        ProductoMedia::create([
            ...$data,
            'producto_id' => $producto->id,
        ]);
        return redirect()
            ->back()
            ->with('success', 'Media agregada.');
    }

    // Desactiva una media; valida pertenencia para evitar inconsistencias.
    public function mediaDestroy(Producto $producto, ProductoMedia $media) {
        if ((int) $media->producto_id !== (int) $producto->id) {
            return redirect()
                ->back()
                ->with('error', 'Media inválida para este producto.');
        }
        $media->update(['status' => 'inactivo']);
        return redirect()
            ->back()
            ->with('success', 'Media desactivada.');
    }

}
