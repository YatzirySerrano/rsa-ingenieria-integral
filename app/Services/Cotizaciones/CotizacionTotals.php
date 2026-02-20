<?php

namespace App\Services\Cotizaciones;

use App\Models\Cotizacion;

class CotizacionTotals {

    public function recalc(Cotizacion $cotizacion): Cotizacion {
        $subtotal = (float) $cotizacion->detalles()
            ->where('status', 'activo')
            ->sum('total_linea');
        $cotizacion->subtotal = $subtotal;
        $cotizacion->total = $subtotal;
        $cotizacion->save();
        return $cotizacion;
    }
    
}