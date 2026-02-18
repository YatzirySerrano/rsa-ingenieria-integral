<?php

namespace App\Http\Controllers;

use App\Http\Requests\Categorias\CategoriaStoreRequest;
use App\Http\Requests\Categorias\CategoriaUpdateRequest;
use App\Http\Resources\CategoriaResource;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaController extends Controller{

    // Metodo para listar todas las categorías con filtros
    public function index(Request $request): Response {
        // Filtros para las tablas: búsqueda, status y tipo.
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status'); // activo|inactivo|null
        $tipo = $request->get('tipo');     // PRODUCTO|SERVICIO|null
        $categorias = Categoria::query()
            ->when($q !== '', fn ($qr) => $qr->where('nombre', 'like', "%{$q}%"))
            ->when($status, fn ($qr) => $qr->where('status', $status))
            ->when($tipo, fn ($qr) => $qr->where('tipo', $tipo))
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();
        // Renderizamos la vista con Inertia y los datos a mandar
        return Inertia::render('Categorias/Index', [
            'items' => CategoriaResource::collection($categorias),
            'filters' => [
                'q' => $q,
                'status' => $status,
                'tipo' => $tipo,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'tipos' => ['PRODUCTO', 'SERVICIO'],
            ],
        ]);
    }

    // Metodo para mostrar la pantalla de alta de una categoría
    public function create(): Response {
        // Pantalla de alta se mandan opciones para selects (En este caos de hace uso de sw alert para el modal)
        return Inertia::render('Categorias/Create', [
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'tipos' => ['PRODUCTO', 'SERVICIO'],
            ],
        ]);
    }

    // Metodo para registrar una nueva categoría
    public function store(CategoriaStoreRequest $request) {
        // Se registra y se regresa al index con flash message.
        Categoria::create($request->validated());
        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría creada correctamente.');
    }

    // Metodo que muestra la pantalla de edición de una categoría
    public function edit(Categoria $categoria): Response {
        return Inertia::render('Categorias/Edit', [
            'item' => new CategoriaResource($categoria),
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'tipos' => ['PRODUCTO', 'SERVICIO'],
            ],
        ]);
    }

    // Metodo para actualizar una categoria
    public function update(CategoriaUpdateRequest $request, Categoria $categoria) {
        $categoria->update($request->validated());
        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría actualizada correctamente.');
    }

    // Metodo para eliminación logica
    public function destroy(Categoria $categoria) {
        // No se borra: se hace eliminación logica
        $categoria->update(['status' => 'inactivo']);
        return redirect()
            ->back()
            ->with('success', 'Categoría desactivada.');
    }

}
