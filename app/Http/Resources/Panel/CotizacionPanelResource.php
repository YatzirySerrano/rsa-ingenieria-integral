<?php

namespace App\Http\Resources\Panel;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CotizacionPanelResource extends JsonResource {

    public function toArray(Request $request): array {
        $totalCalculado = (float) ($this->relationLoaded('detalles')
            ? $this->detalles->where('status', 'activo')->sum('total_linea')
            : $this->detalles()->where('status', 'activo')->sum('total_linea'));
        $total = (float) $this->total;
        $diff = round($total - $totalCalculado, 2);
        return [
            'id' => $this->id,
            'folio' => $this->folio,
            'token' => $this->token,
            'estatus' => $this->estatus,
            'email_destino' => $this->email_destino,
            'telefono_destino' => $this->telefono_destino,
            'subtotal' => $this->subtotal,
            'total' => $this->total,
            'status' => $this->status,
            'total_calculado' => $totalCalculado,
            'diferencia_total' => $diff ?: 0.0,
            'ready_to_send' => in_array($this->estatus, ['DEVUELTA', 'ENVIADA'], true),
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'detalles' => CotizacionDetalleResource::collection($this->whenLoaded('detalles')),
        ];
    }

}