<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoMediaResource extends JsonResource {

    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'producto_id' => $this->producto_id,
            'tipo' => $this->tipo,
            'url' => $this->url,
            'orden' => $this->orden,
            'principal' => (bool) $this->principal,
            'status' => $this->status,
        ];
    }

}
