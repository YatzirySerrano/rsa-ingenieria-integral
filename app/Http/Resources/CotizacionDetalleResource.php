<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CotizacionDetalleResource extends JsonResource {

    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'cotizacion_id' => $this->cotizacion_id,
            'producto_id' => $this->producto_id,
            'servicio_id' => $this->servicio_id,
            'cantidad' => (string) $this->cantidad,
            'precio_unitario' => (string) $this->precio_unitario,
            'total_linea' => (string) $this->total_linea,
            'status' => $this->status,
            // Para UI: mostrar nombre y precio del item sin hacer queries extra en Vue.
            'producto' => $this->whenLoaded('producto', fn () => [
                'id' => $this->producto?->id,
                'nombre' => $this->producto?->nombre,
                'precio' => $this->producto?->precio ?? null,
            ]),
            'servicio' => $this->whenLoaded('servicio', fn () => [
                'id' => $this->servicio?->id,
                'nombre' => $this->servicio?->nombre,
                'precio' => $this->servicio?->precio ?? null,
            ]),
        ];
    }

}
