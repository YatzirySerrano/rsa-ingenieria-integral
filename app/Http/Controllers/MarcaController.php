<?php

namespace App\Http\Controllers;

use App\Http\Requests\Marcas\MarcaStoreRequest;
use App\Http\Requests\Marcas\MarcaUpdateRequest;
use App\Http\Resources\MarcaResource;
use App\Models\Marca;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarcaController extends Controller {

    // Metodo para filtrar marcas por nombre y status
    public function index(Request $request): Response {
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status');
        $marcas = Marca::query()
            ->when($q !== '', fn($qr) => $qr->where('nombre', 'like', "%{$q}%"))
            ->when($status, fn($qr) => $qr->where('status', $status))
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();
        return Inertia::render('Marcas/Index', [
            'items' => [
                // ARRAY real (lo que tu v-for espera)
                'data' => MarcaResource::collection($marcas->items())->resolve(),
                // ARRAY de links (lo que PaginationLinks espera)
                'links' => $marcas->linkCollection()->toArray(),
                // meta opcional por si lo usas
                'meta' => [
                    'current_page' => $marcas->currentPage(),
                    'last_page' => $marcas->lastPage(),
                    'per_page' => $marcas->perPage(),
                    'total' => $marcas->total(),
                ],
            ],
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    // Metodo para mostrar la pantalla de alta de una marca
    public function create(): Response {
        return Inertia::render('Marcas/Create', [
            'meta' => ['statuses' => ['activo', 'inactivo']],
        ]);
    }

    // Metodo para guardar una marca
    public function store(MarcaStoreRequest $request) {
        Marca::create($request->validated());

        return redirect()
            ->route('marcas.index')
            ->with('success', 'Marca creada correctamente.');
    }

    // Metodo para mostrar la pantalla de edición de una marca
    public function edit(Marca $marca): Response {
        return Inertia::render('Marcas/Edit', [
            'item' => new MarcaResource($marca),
            'meta' => ['statuses' => ['activo', 'inactivo']],
        ]);
    }

    // Metodo para actualización de una marca
    public function update(MarcaUpdateRequest $request, Marca $marca) {
        $marca->update($request->validated());
        return redirect()
            ->route('marcas.index')
            ->with('success', 'Marca actualizada correctamente.');
    }

    // Metodo para eliminacion logica
    public function destroy(Marca $marca) {
        $marca->update(['status' => 'inactivo']);

        return redirect()
            ->back()
            ->with('success', 'Marca desactivada.');
    }

}
