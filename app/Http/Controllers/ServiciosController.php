<?php

namespace App\Http\Controllers;

use App\Http\Requests\Servicios\ServicioStoreRequest;
use App\Http\Requests\Servicios\ServicioUpdateRequest;
use App\Http\Resources\ServicioResource;
use App\Models\Categoria;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiciosController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $status = (string) $request->get('status', 'activo');

        $servicios = Servicio::query()
            ->with(['categoria'])
            ->when($status !== 'todos', fn($qq) => $qq->where('status', $status))
            ->when($q !== '', fn($qq) => $qq->where('nombre','like',"%{$q}%"))
            ->orderBy('id','desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Servicios/Index', [
            'filters' => ['q' => $q, 'status' => $status],
            'servicios' => [
                'data' => ServicioResource::collection($servicios->items()),
                'links' => $servicios->linkCollection(),
                'meta' => [
                    'current_page' => $servicios->currentPage(),
                    'last_page' => $servicios->lastPage(),
                    'total' => $servicios->total(),
                ],
            ],
            'categorias' => Categoria::query()->where('status','activo')->where('tipo','SERVICIO')->orderBy('nombre')->get(['id','nombre']),
        ]);
    }

    public function store(ServicioStoreRequest $request)
    {
        Servicio::create($request->validated());
        return back()->with('success','Servicio creado.');
    }

    public function update(ServicioUpdateRequest $request, Servicio $servicio)
    {
        $servicio->update($request->validated());
        return back()->with('success','Servicio actualizado.');
    }

    public function destroy(Request $request, Servicio $servicio)
    {
        $servicio->update(['status' => 'inactivo']);
        return back()->with('success','Servicio desactivado.');
    }

}
