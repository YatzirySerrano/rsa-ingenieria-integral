<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Panel\CotizacionDetalleUpdateRequest;
use App\Models\CotizacionDetalle;
use App\Services\Cotizaciones\CotizacionTotals;

class CotizacionDetalleController extends Controller {

    public function __construct(private CotizacionTotals $totals) {}

    public function update(CotizacionDetalleUpdateRequest $request, CotizacionDetalle $detalle) {
        abort_unless($detalle->status === 'activo', 404);
        $detalle->cantidad = (float) $request->input('cantidad');
        $detalle->precio_unitario = (float) $request->input('precio_unitario');
        $detalle->total_linea = round(((float)$detalle->cantidad) * ((float)$detalle->precio_unitario), 2);
        $detalle->save();
        $this->totals->recalc($detalle->cotizacion);
        return back(303);
    }

    public function destroy(CotizacionDetalle $detalle) {
        abort_unless($detalle->status === 'activo', 404);
        $detalle->status = 'inactivo';
        $detalle->save();
        $this->totals->recalc($detalle->cotizacion);
        return back(303);
    }

}