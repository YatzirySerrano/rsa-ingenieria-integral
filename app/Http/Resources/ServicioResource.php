<?php

namespace App\Http\Resources;

use App\Models\Servicio;

class ServicioResource {

    public static function make(Servicio $s): array {
        return [
            'id' => $s->id,
            'nombre' => $s->nombre,
            'descripcion' => $s->descripcion,
            'precio' => (string) $s->precio,
            'status' => $s->status,
            'categoria' => $s->categoria ? ['id' => $s->categoria->id, 'nombre' => $s->categoria->nombre] : null,
        ];
    }

    public static function collection($items): array {
        return collect($items)->map(fn($s) => self::make($s))->all();
    }

}
