<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Log extends Model {

    use HasFactory, SoftDeletes;

    // Nombre de la tabla
    protected $table = 'logs';

    // Campos asignables masivamente
    protected $fillable = [
        'usuario_id',
        'accion',
        'tabla',
        'registro_id',
        'detalle',
        'status',
    ];

    // Casts automáticos
    protected $casts = [
        'detalle' => 'array',
    ];

    //  Relación: el usuario que realizó la acción
    public function usuario() {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // Scope: solo logs exitosos
    public function scopeExitosos($query) {
        return $query->where('status', 'success');
    }

    // Scope: filtrar por tabla afectada
    public function scopeTabla($query, string $tabla) {
        return $query->where('tabla', $tabla);
    }

    // Scope: filtrar por acción
    public function scopeAccion($query, string $accion) {
        return $query->where('accion', $accion);
    }

}
