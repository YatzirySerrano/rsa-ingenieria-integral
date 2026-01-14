<?php

namespace App\Http\Controllers;

use App\Http\Requests\CotizacionDetalles\CotizacionDetalleUpdateRequest;
use App\Http\Resources\CotizacionDetalleResource;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionDetalleController extends Controller {

    // Metodo para filtrar detalles de cotización
    public function index(Request $request): Response {
        // Listado general (si existe pantalla), filtra por cotizacion_id.
        $cotizacionId = $request->get('cotizacion_id');
        $items = CotizacionDetalle::query()
            ->when($cotizacionId, fn ($qr) => $qr->where('cotizacion_id', $cotizacionId))
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();
        return Inertia::render('CotizacionDetalles/Index', [
            'items' => CotizacionDetalleResource::collection($items),
            'filters' => ['cotizacion_id' => $cotizacionId],
        ]);
    }

    // Metodo para mostrar un detalle de cotización.
    public function edit(CotizacionDetalle $cotizacionDetalle): Response {
        $cotizacionDetalle->load(['producto', 'servicio']);
        return Inertia::render('CotizacionDetalles/Edit', [
            'item' => new CotizacionDetalleResource($cotizacionDetalle),
        ]);
    }

    // Metodo para actualizar un detalle de cotización.
    public function update(CotizacionDetalleUpdateRequest $request, CotizacionDetalle $cotizacionDetalle) {
        // Se recalcula total_linea para que no quede incoherente con UI.
        $data = $request->validated();
        $totalLinea = round(((float) $data['cantidad']) * ((float) $data['precio_unitario']), 2);
        $cotizacionDetalle->update([
            ...$data,
            'total_linea' => $totalLinea,
        ]);
        // Recalcular totales de la cabecera (siempre que se toque un detalle).
        $cotizacion = Cotizacion::find($cotizacionDetalle->cotizacion_id);
        if ($cotizacion) {
            $subtotal = (float) CotizacionDetalle::query()
                ->where('cotizacion_id', $cotizacion->id)
                ->where('status', 'activo')
                ->sum('total_linea');

            $cotizacion->update([
                'subtotal' => round($subtotal, 2),
                'total' => round($subtotal, 2),
            ]);
        }
        return redirect()
            ->back()
            ->with('success', 'Detalle actualizado.');
    }

    // Metodo para eliminación logica de un detalle de cotización.
    public function destroy(CotizacionDetalle $cotizacionDetalle) {
        // Inactivar detalle y recalcular cabecera.
        $cotizacionDetalle->update(['status' => 'inactivo']);
        $cotizacion = Cotizacion::find($cotizacionDetalle->cotizacion_id);
        if ($cotizacion) {
            $subtotal = (float) CotizacionDetalle::query()
                ->where('cotizacion_id', $cotizacion->id)
                ->where('status', 'activo')
                ->sum('total_linea');
            $cotizacion->update([
                'subtotal' => round($subtotal, 2),
                'total' => round($subtotal, 2),
            ]);
        }
        return redirect()
            ->back()
            ->with('success', 'Detalle desactivado.');
    }

}
