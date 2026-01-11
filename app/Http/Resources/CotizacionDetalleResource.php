<?php

namespace App\Http\Resources;

use App\Models\CotizacionDetalle;

class CotizacionDetalleResource
{
    public static function make(CotizacionDetalle $d): array
    {
        $tipo = $d->producto_id ? 'PRODUCTO' : 'SERVICIO';

        return [
            'id' => $d->id,
            'tipo' => $tipo,
            'cantidad' => (string) $d->cantidad,
            'precio_unitario' => (string) $d->precio_unitario,
            'total_linea' => (string) $d->total_linea,
            'status' => $d->status,
            'producto' => $d->relationLoaded('producto') && $d->producto
                ? ['id' => $d->producto->id, 'sku' => $d->producto->sku, 'nombre' => $d->producto->nombre]
                : null,
            'servicio' => $d->relationLoaded('servicio') && $d->servicio
                ? ['id' => $d->servicio->id, 'nombre' => $d->servicio->nombre]
                : null,
        ];
    }

    public static function collection($items): array
    {
        return collect($items)->map(fn($d) => self::make($d))->all();
    }
    
}
