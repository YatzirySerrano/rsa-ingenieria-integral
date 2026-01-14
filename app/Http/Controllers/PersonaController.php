<?php

namespace App\Http\Controllers;

use App\Http\Requests\Personas\PersonaStoreRequest;
use App\Http\Requests\Personas\PersonaUpdateRequest;
use App\Http\Resources\PersonaResource;
use App\Models\Persona;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonaController extends Controller
{
    // Listado de personas/clientes con filtros de búsqueda general.
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status');

        $personas = Persona::query()
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($w) use ($q) {
                    $w->where('nombre', 'like', "%{$q}%")
                      ->orWhere('apellido_paterno', 'like', "%{$q}%")
                      ->orWhere('apellido_materno', 'like', "%{$q}%")
                      ->orWhere('empresa', 'like', "%{$q}%")
                      ->orWhere('telefono', 'like', "%{$q}%")
                      ->orWhere('rfc', 'like', "%{$q}%");
                });
            })
            ->when($status, fn($qr) => $qr->where('status', $status))
            ->orderBy('id', 'desc')
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

    public function create(): Response
    {
        return Inertia::render('Personas/Create', [
            'meta' => ['statuses' => ['activo', 'inactivo']],
        ]);
    }

    public function store(PersonaStoreRequest $request)
    {
        Persona::create($request->validated());

        return redirect()
            ->route('personas.index')
            ->with('success', 'Persona creada correctamente.');
    }

    public function edit(Persona $persona): Response
    {
        return Inertia::render('Personas/Edit', [
            'item' => new PersonaResource($persona),
            'meta' => ['statuses' => ['activo', 'inactivo']],
        ]);
    }

    public function update(PersonaUpdateRequest $request, Persona $persona)
    {
        $persona->update($request->validated());

        return redirect()
            ->route('personas.index')
            ->with('success', 'Persona actualizada correctamente.');
    }

    public function destroy(Persona $persona)
    {
        $persona->update(['status' => 'inactivo']);

        return redirect()
            ->back()
            ->with('success', 'Persona desactivada.');
    }
    
}
