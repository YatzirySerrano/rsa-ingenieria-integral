<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Persona extends Model {

    protected $table = 'personas';

    protected $fillable = [
        'usuario_id',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'telefono',
        'empresa',
        'rfc',
        'direccion',
        'status',
    ];

    // Scope para filtrar por estado activo
    public function scopeActivo(Builder $q): Builder {
        return $q->where('status', 'activo');
    }

    // Relación derl usuario de la persona
    public function usuario(): BelongsTo {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Metodo para obtener nombre completo de la persona.
    public function getNombreCompletoAttribute(): string {
        // Se arma nombre completo para UI sin repetir lógica en Vue.
        $parts = array_filter([
            $this->nombre,
            $this->apellido_paterno,
            $this->apellido_materno,
        ]);

        return trim(implode(' ', $parts));
    }

}
