<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource {
    
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'marca_id' => $this->marca_id,
            'categoria_id' => $this->categoria_id,
            'sku' => $this->sku,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'stock' => (int) $this->stock,
            'costo_lista' => (string) $this->costo_lista,
            'precio_venta' => (string) $this->precio_venta,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'deleted_by' => $this->deleted_by,
            'status' => $this->status,
            'marca' => $this->whenLoaded('marca', fn () => [
                'id' => $this->marca?->id,
                'nombre' => $this->marca?->nombre,
                'status' => $this->marca?->status,
            ]),
            'categoria' => $this->whenLoaded('categoria', fn () => [
                'id' => $this->categoria?->id,
                'nombre' => $this->categoria?->nombre,
                'tipo' => $this->categoria?->tipo,
                'status' => $this->categoria?->status,
            ]),
            'medias' => $this->whenLoaded('medias', fn () =>
                ProductoMediaResource::collection($this->medias)
            ),
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
        ];
    }

}
