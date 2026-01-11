<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Marca extends Model {
    
    protected $table = 'marcas';

    // Campos de la tabla
    protected $fillable = ['nombre', 'status'];

    // Metodo para relacionar productos
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'marca_id');
    }

    public function scopeActivo(Builder $q): Builder
    {
        return $q->where('status','activo');
    }

}
