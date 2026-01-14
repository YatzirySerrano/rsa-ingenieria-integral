<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CotizacionResource extends JsonResource {

    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'persona_id' => $this->persona_id,
            'folio' => $this->folio,
            'token' => $this->token,
            'estatus' => $this->estatus,
            'email_destino' => $this->email_destino,
            'telefono_destino' => $this->telefono_destino,
            'subtotal' => (string) $this->subtotal,
            'total' => (string) $this->total,
            'status' => $this->status,
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'detalles' => $this->whenLoaded('detalles', fn () =>
                CotizacionDetalleResource::collection($this->detalles)
            ),
        ];
    }

}
