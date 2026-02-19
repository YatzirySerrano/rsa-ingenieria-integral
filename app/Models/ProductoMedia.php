<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoMedia extends Model {

    protected $table = 'producto_medias';

    protected $fillable = [
        'producto_id',
        'tipo',
        'url',
        'orden',
        'principal',
        'status',
    ];

    protected $casts = [
        'orden' => 'integer',
        'principal' => 'boolean',
    ];

    public function producto(): BelongsTo {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

}
