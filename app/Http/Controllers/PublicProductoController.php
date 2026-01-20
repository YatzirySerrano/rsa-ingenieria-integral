<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductoResource;
use App\Http\Resources\MarcaResource;
use App\Http\Resources\CategoriaResource;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicProductoController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));
        $marcaId = $request->get('marca_id');
        $categoriaId = $request->get('categoria_id');

        $productos = Producto::query()
            ->activo()
            ->with(['marca', 'categoria', 'medias'])
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($w) use ($q) {
                    $w->where('sku', 'like', "%{$q}%")
                      ->orWhere('nombre', 'like', "%{$q}%");
                });
            })
            ->when($marcaId, fn ($qr) => $qr->where('marca_id', $marcaId))
            ->when($categoriaId, fn ($qr) => $qr->where('categoria_id', $categoriaId))
            ->orderBy('nombre')
            ->paginate(24)
            ->withQueryString();

        $marcas = Marca::query()
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get();

        $categorias = Categoria::query()
            ->where('tipo', 'PRODUCTO')
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Productos/Show', [
            'items' => ProductoResource::collection($productos),
            'filters' => [
                'q' => $q,
                'marca_id' => $marcaId,
                'categoria_id' => $categoriaId,
            ],
            'meta' => [
                'marcas' => MarcaResource::collection($marcas),
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }
}
