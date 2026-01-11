<?php

namespace App\Http\Resources;

use App\Models\Cotizacion;

class CotizacionResource {
    
    public static function make(Cotizacion $c): array {
        return [
            'id' => $c->id,
            'folio' => $c->folio,
            'token' => $c->token,
            'estatus' => $c->estatus,
            'email_destino' => $c->email_destino,
            'telefono_destino' => $c->telefono_destino,
            'subtotal' => (string) $c->subtotal,
            'total' => (string) $c->total,
            'status' => $c->status,
            'detalles' => $c->relationLoaded('detalles')
                ? CotizacionDetalleResource::collection($c->detalles)
                : [],
            'created_at' => $c->created_at?->toDateTimeString(),
        ];
    }

}
