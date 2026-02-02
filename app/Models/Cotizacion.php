<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cotizacion extends Model {

    protected $table = 'cotizacions';

    // Campos del modelo
    protected $fillable = [
        'usuario_id','persona_id',
        'folio','token','estatus',
        'email_destino','telefono_destino',
        'subtotal','total','status'
    ];

    // Campos que necesitan casteo
    protected $casts = [
        'token' => 'string',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Metodo para filtra por estado activo
    public function scopeActivo(Builder $q): Builder {
        return $q->where('status', 'activo');
    }

    // Una cotizacion tiene un usuario
    public function usuario(): BelongsTo {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // Una cotizacion tiene una persona
    public function persona(): BelongsTo {
        return $this->belongsTo(Persona::class, 'persona_id');
    }

    // Una cotizacion tiene varios detalles
    public function detalles(): HasMany {
        return $this->hasMany(CotizacionDetalle::class, 'cotizacion_id')
            ->where('status', 'activo')
            ->latest('id');
    }

}
