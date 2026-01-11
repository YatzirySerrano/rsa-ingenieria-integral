<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Servicio extends Model
{
    protected $table = 'servicios';

    protected $fillable = [
        'categoria_id','nombre','descripcion','precio','status'
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function scopeActivo(Builder $q): Builder
    {
        return $q->where('status', 'activo');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }
}
