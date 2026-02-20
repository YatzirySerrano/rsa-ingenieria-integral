<?php

namespace App\Http\Resources\Panel;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CotizacionDetalleResource extends JsonResource {

    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'cotizacion_id' => $this->cotizacion_id,
            'producto_id' => $this->producto_id,
            'servicio_id' => $this->servicio_id,
            'cantidad' => $this->cantidad,
            'precio_unitario' => $this->precio_unitario,
            'total_linea' => $this->total_linea,
            'status' => $this->status,
            'producto' => $this->whenLoaded('producto', fn () => $this->producto ? [
                'id' => $this->producto->id,
                'sku' => $this->producto->sku,
                'nombre' => $this->producto->nombre,
            ] : null),
            'servicio' => $this->whenLoaded('servicio', fn () => $this->servicio ? [
                'id' => $this->servicio->id,
                'nombre' => $this->servicio->nombre,
            ] : null),
        ];
    }
    
}