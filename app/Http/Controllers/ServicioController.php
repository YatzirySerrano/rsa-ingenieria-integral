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

class ServicioController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));

        $status = $request->get('status');
        $status = is_string($status) ? trim($status) : $status;
        if ($status === '' || $status === '__ALL__' || $status === '__all__') $status = null;

        $categoriaId = $request->get('categoria_id');
        $categoriaId = is_string($categoriaId) ? trim($categoriaId) : $categoriaId;
        if ($categoriaId === '' || $categoriaId === '__ALL__' || $categoriaId === '__all__') $categoriaId = null;

        $perPage = (int) $request->get('per_page', 10);
        if ($perPage <= 0) $perPage = 10;
        if ($perPage > 100) $perPage = 100;

        $servicios = Servicio::query()
            ->with(['categoria'])
            ->when($q !== '', fn ($qr) => $qr->where(function ($w) use ($q) {
                $w->where('nombre', 'like', "%{$q}%")
                  ->orWhere('descripcion', 'like', "%{$q}%");
            }))
            ->when($status, fn ($qr) => $qr->where('status', $status))
            ->when($categoriaId, fn ($qr) => $qr->where('categoria_id', $categoriaId))
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

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
                'per_page' => $perPage,
            ],
            'meta' => [
                'statuses' => ['activo', 'inactivo'],
                'categorias' => CategoriaResource::collection($categorias),
            ],
        ]);
    }

    public function store(ServicioStoreRequest $request)
    {
        $data = $request->validated();

        // Estatus automático: siempre activo al crear
        $data['status'] = 'activo';

        $servicio = Servicio::create($data);

        if ($request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'message' => 'Servicio creado correctamente.',
                'data' => new ServicioResource($servicio->load('categoria')),
            ]);
        }

        return redirect()
            ->route('servicios.index')
            ->with('success', 'Servicio creado correctamente.');
    }

    public function update(ServicioUpdateRequest $request, Servicio $servicio)
    {
        $data = $request->validated();

        // Blindaje: el status NO se toca en edit (solo cambia con delete lógico)
        unset($data['status']);

        $servicio->update($data);

        if ($request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'message' => 'Servicio actualizado correctamente.',
                'data' => new ServicioResource($servicio->fresh()->load('categoria')),
            ]);
        }

        return redirect()
            ->route('servicios.index')
            ->with('success', 'Servicio actualizado correctamente.');
    }

    public function destroy(Request $request, Servicio $servicio)
    {
        $servicio->update(['status' => 'inactivo']);

        if ($request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'message' => 'Servicio desactivado.',
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'Servicio desactivado.');
    }

    public function reactivate(Request $request, Servicio $servicio)
    {
        $servicio->update(['status' => 'activo']);

        if ($request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'message' => 'Servicio reactivado.',
                'data' => new ServicioResource($servicio->fresh()->load('categoria')),
            ]);
        }

        return redirect()->back()->with('success', 'Servicio reactivado.');
    }

}
