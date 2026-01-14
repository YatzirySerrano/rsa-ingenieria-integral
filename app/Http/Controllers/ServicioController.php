<?php

namespace App\Http\Controllers;

use App\Http\Requests\Servicios\ServicioStoreRequest;
use App\Http\Requests\Servicios\ServicioUpdateRequest;
use App\Http\Resources\ServicioResource;
use App\Http\Resources\CategoriaResource;
use App\Models\Servicio;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServicioController extends Controller {

    // Listado con filtros para el catálogo de servicios.
    public function index(Request $request): Response {
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status');
        $categoriaId = $request->get('categoria_id');

        $servicios = Servicio::query()
            ->with(['categoria'])
            ->when($q !== '', fn($qr) => $qr->where('nombre', 'like', "%{$q}%"))
            ->when($status, fn($qr) => $qr->where('status', $status))
            ->when($categoriaId, fn($qr) => $qr->where('categoria_id', $categoriaId))
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();
        // Solo categorías tipo SERVICIO para evitar mezclar catálogos.
        $categorias = Categoria::query()
            ->where('tipo', 'SERVICIO')
            ->orderBy('nombre')
            ->get();
        return Inertia::render('servicios/Index', [
            'items' => ServicioResource::collection($servicios),
            'filters' => [
                'q' => $q,
                'status' => $status,
                'categoria_id' => $categoriaId,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    // Pantalla de alta.
    public function create(): Response {
        $categorias = Categoria::query()
            ->where('tipo', 'SERVICIO')
            ->orderBy('nombre')
            ->get();
        return Inertia::render('servicios/Create', [
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    // Alta: crea y regresa a index.
    public function store(ServicioStoreRequest $request) {
        Servicio::create($request->validated());
        return redirect()
            ->route('servicios.index')
            ->with('success', 'Servicio creado correctamente.');
    }

    // Pantalla de edición.
    public function edit(Servicio $servicio): Response {
        $categorias = Categoria::query()
            ->where('tipo', 'SERVICIO')
            ->orderBy('nombre')
            ->get();
        $servicio->load('categoria');
        return Inertia::render('Servicios/Edit', [
            'item' => new ServicioResource($servicio),
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    // Edición: actualiza y regresa a index.
    public function update(ServicioUpdateRequest $request, Servicio $servicio) {
        $servicio->update($request->validated());
        return redirect()
            ->route('servicios.index')
            ->with('success', 'Servicio actualizado correctamente.');
    }

    // Eliminación lógica.
    public function destroy(Servicio $servicio) {
        $servicio->update(['status' => 'inactivo']);
        return redirect()
            ->back()
            ->with('success', 'Servicio desactivado.');
    }

}
