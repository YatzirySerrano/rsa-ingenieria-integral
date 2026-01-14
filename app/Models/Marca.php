<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Marca extends Model {

    protected $table = 'marcas';

    // Campos de la tabla
    protected $fillable = ['nombre', 'status'];

    // Una marca tiene muchos productos
    public function productos(): HasMany {
        return $this->hasMany(Producto::class, 'marca_id');
    }

    // Scope para filtrar por estado activo
    public function scopeActivo(Builder $q): Builder {
        return $q->where('status','activo');
    }

}
