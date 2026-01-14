<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonaResource extends JsonResource {
    
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'nombre' => $this->nombre,
            'apellido_paterno' => $this->apellido_paterno,
            'apellido_materno' => $this->apellido_materno,
            'telefono' => $this->telefono,
            'empresa' => $this->empresa,
            'rfc' => $this->rfc,
            'direccion' => $this->direccion,
            'nombre_completo' => $this->nombre_completo ?? trim(implode(' ', array_filter([
                $this->nombre,
                $this->apellido_paterno,
                $this->apellido_materno,
            ]))),
            'status' => $this->status,
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
        ];
    }

}
