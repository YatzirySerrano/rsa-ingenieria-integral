<?php

namespace App\Http\Resources;

use App\Models\Producto;

class ProductoResource {
    
    public static function make(Producto $p): array
    {
        return [
            'id' => $p->id,
            'sku' => $p->sku,
            'nombre' => $p->nombre,
            'descripcion' => $p->descripcion,
            'stock' => $p->stock,
            'costo_lista' => (string) $p->costo_lista,
            'precio_venta' => (string) $p->precio_venta,
            'status' => $p->status,
            'marca' => $p->marca ? ['id' => $p->marca->id, 'nombre' => $p->marca->nombre] : null,
            'categoria' => $p->categoria ? ['id' => $p->categoria->id, 'nombre' => $p->categoria->nombre] : null,
            'medias' => $p->relationLoaded('medias')
                ? $p->medias->where('status','activo')->values()->map(fn($m) => ProductoMediaResource::make($m))->all()
                : [],
            'created_at' => $p->created_at?->toDateTimeString(),
            'updated_at' => $p->updated_at?->toDateTimeString(),
        ];
    }

    public static function collection($items): array
    {
        return collect($items)->map(fn($p) => self::make($p))->all();
    }
    
}
