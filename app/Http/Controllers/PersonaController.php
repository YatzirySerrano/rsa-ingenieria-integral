<?php

namespace App\Http\Controllers;

use App\Http\Requests\Personas\PersonaStoreRequest;
use App\Http\Requests\Personas\PersonaUpdateRequest;
use App\Http\Resources\PersonaResource;
use App\Models\Persona;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonaController extends Controller {

    // Listado de personas/clientes con filtros de búsqueda general.
    public function index(Request $request): Response {
        $q = trim((string) $request->get('q', ''));
        // Default: activo (si no viene)
        $status = $request->has('status')
            ? trim((string) $request->get('status'))
            : 'activo';

        $ALL = '__all__';
        $personas = Persona::query()
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($w) use ($q) {
                    $w->where('nombre', 'like', "%{$q}%")
                    ->orWhere('apellido_paterno', 'like', "%{$q}%")
                    ->orWhere('apellido_materno', 'like', "%{$q}%")
                    ->orWhere('empresa', 'like', "%{$q}%")
                    ->orWhere('telefono', 'like', "%{$q}%")
                    ->orWhere('rfc', 'like', "%{$q}%")
                    ->orWhere('direccion', 'like', "%{$q}%");
                });
            })
            ->when(
                $status !== '' && $status !== $ALL,
                function ($qr) use ($status) {
                    // Solo filtra si es válido
                    if (in_array($status, ['activo', 'inactivo'], true)) {
                        $qr->where('status', $status);
                    }
                }
            )
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();
        return Inertia::render('Personas/Index', [
            'items' => PersonaResource::collection($personas),
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    // Metodo para notificar el registro de una persona
    public function create(): Response {
        return Inertia::render('Personas/Create', [
            'meta' => ['statuses' => ['activo', 'inactivo']],
        ]);
    }

    // Metodo para registrar una persona
    public function store(PersonaStoreRequest $request) {
        Persona::create($request->validated());
        return redirect()
            ->route('personas.index')
            ->with('success', 'Persona creada correctamente.');
    }

    // Metodo para notificar el cambio de estado de una persona
    public function edit(Persona $persona): Response {
        return Inertia::render('Personas/Edit', [
            'item' => new PersonaResource($persona),
            'meta' => ['statuses' => ['activo', 'inactivo']],
        ]);
    }

    // Metodo para actualización de persona
    public function update(PersonaUpdateRequest $request, Persona $persona) {
        $persona->update($request->validated());
        return redirect()
            ->route('personas.index')
            ->with('success', 'Persona actualizada correctamente.');
    }

    // Metodo para eliminación logica
    public function destroy(Persona $persona) {
        $persona->update(['status' => 'inactivo']);
        return redirect()
            ->back()
            ->with('success', 'Persona desactivada.');
    }
    
}
