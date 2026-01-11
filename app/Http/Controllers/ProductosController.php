<?php

namespace App\Http\Controllers;

use App\Http\Requests\Productos\ProductoStoreRequest;
use App\Http\Requests\Productos\ProductoUpdateRequest;
use App\Http\Requests\ProductoMedia\ProductoMediaStoreRequest;
use App\Http\Resources\ProductoResource;
use App\Http\Resources\ProductoMediaResource;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use App\Models\ProductoMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductosController extends Controller {

    // Metodo para filtrar lista
    public function index(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $status = (string) $request->get('status', 'activo');

        $productos = Producto::query()
            ->with(['marca','categoria','medias'])
            ->when($status !== 'todos', fn($qq) => $qq->where('status', $status))
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('sku', 'like', "%{$q}%")
                      ->orWhere('nombre', 'like', "%{$q}%");
                });
            })
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Productos/Index', [
            'filters' => ['q' => $q, 'status' => $status],
            'productos' => [
                'data' => ProductoResource::collection($productos->items()),
                'links' => $productos->linkCollection(),
                'meta' => [
                    'current_page' => $productos->currentPage(),
                    'last_page' => $productos->lastPage(),
                    'total' => $productos->total(),
                ],
            ],
            'marcas' => Marca::query()->where('status','activo')->orderBy('nombre')->get(['id','nombre']),
            'categorias' => Categoria::query()->where('status','activo')->where('tipo','PRODUCTO')->orderBy('nombre')->get(['id','nombre']),
        ]);
    }

    // Metodo para registrar un producto
    public function store(ProductoStoreRequest $request)
    {
        $userId = auth()->id();

        Producto::create(array_merge(
            $request->validated(),
            [
                'created_by' => $userId,
                'updated_by' => $userId,
            ]
        ));

        return back()->with('success', 'Producto creado.');
    }

    // Metodo para modificar un producto
    public function update(ProductoUpdateRequest $request, Producto $producto)
    {
        $userId = auth()->id();

        $producto->update(array_merge(
            $request->validated(),
            ['updated_by' => $userId]
        ));

        return back()->with('success', 'Producto actualizado.');
    }

    // Metodo para eliminacion logica de un producto
    public function destroy(Request $request, Producto $producto)
    {
        $userId = auth()->id();

        $producto->update([
            'status' => 'inactivo',
            'deleted_by' => $userId,
            'updated_by' => $userId,
        ]);

        return back()->with('success', 'Producto desactivado.');
    }

    // Metodo para guardar fotos del producto
    public function mediaStore(ProductoMediaStoreRequest $request, Producto $producto)
    {
        $data = $request->validated();

        DB::transaction(function () use ($producto, $data) {
            if (!empty($data['principal'])) {
                ProductoMedia::where('producto_id', $producto->id)->update(['principal' => 0]);
            }

            $producto->medias()->create([
                'tipo' => $data['tipo'],
                'url' => $data['url'],
                'orden' => $data['orden'] ?? 1,
                'principal' => (bool) ($data['principal'] ?? false),
                'status' => $data['status'],
            ]);
        });

        return back()->with('success', 'Media agregada.');
    }

    // Metodo para eliminar alguna foto o recurso del producto
    public function mediaDestroy(Request $request, Producto $producto, ProductoMedia $media)
    {
        if ((int) $media->producto_id !== (int) $producto->id) {
            abort(404);
        }

        $media->update(['status' => 'inactivo']);
        return back()->with('success', 'Media desactivada.');
    }

}
