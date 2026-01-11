<?php

namespace App\Http\Resources;

use App\Models\ProductoMedia;

class ProductoMediaResource {

    public static function make(ProductoMedia $m): array
    {
        return [
            'id' => $m->id,
            'tipo' => $m->tipo,        // imagen|video
            'url' => $m->url,
            'orden' => $m->orden,
            'principal' => (bool) $m->principal,
            'status' => $m->status,
        ];
    }

}
