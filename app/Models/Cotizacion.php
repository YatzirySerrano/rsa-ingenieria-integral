<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cotizacion extends Model
{
    protected $table = 'cotizacions';

    protected $fillable = [
        'usuario_id','persona_id',
        'folio','token','estatus',
        'email_destino','telefono_destino',
        'subtotal','total','status'
    ];

    protected $casts = [
        'token' => 'string',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function scopeActivo(Builder $q): Builder
    {
        return $q->where('status', 'activo');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(CotizacionDetalle::class, 'cotizacion_id')
            ->where('status', 'activo')
            ->latest('id');
    }
}
