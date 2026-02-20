<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Panel\CotizacionDetalleUpdateRequest;
use App\Models\CotizacionDetalle;
use App\Services\Cotizaciones\CotizacionTotals;

class CotizacionDetalleController extends Controller {

    public function __construct(private CotizacionTotals $totals) {}

    private function ensurePanelActor(): void {
        abort_unless(auth()->check(), 403);
    }

    public function update(CotizacionDetalleUpdateRequest $request, CotizacionDetalle $detalle) {
        $this->ensurePanelActor();
        $cotizacion = $detalle->cotizacion()->firstOrFail();
        if (strtoupper((string) $cotizacion->estatus) === 'ENVIADA') {
            abort(422, 'La cotización ya fue marcada como ENVIADA.');
        }
        $cantidad = (int) $request->validated('cantidad');
        $detalle->cantidad = $cantidad;
        $detalle->total_linea = $cantidad * (float) $detalle->precio_unitario;
        $detalle->save();
        // Tu service solo tiene recalc()
        $this->totals->recalc($cotizacion);
        return back();
    }

    public function destroy(CotizacionDetalle $detalle) {
        $this->ensurePanelActor();
        $cotizacion = $detalle->cotizacion()->firstOrFail();
        if (strtoupper((string) $cotizacion->estatus) === 'ENVIADA') {
            abort(422, 'La cotización ya fue marcada como ENVIADA.');
        }
        $detalle->update(['status' => 'inactivo']);
        //  Recalcula subtotal/total con SOLO activos (ya lo haces en el service)
        $this->totals->recalc($cotizacion);
        return back();
    }

}
