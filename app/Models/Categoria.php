<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model{

    protected $table = 'categorias';

    protected $fillable = ['nombre', 'tipo', 'status'];

    // Una categoria tiene muchos productos
    public function productos(): HasMany {
        return $this->hasMany(Producto::class, 'categoria_id');
    }

    // Una categoria tiene muchos servicios
    public function servicios(): HasMany {
        return $this->hasMany(Servicio::class, 'categoria_id');
    }

    // Metodo para filtrar por estado activo
    public function scopeActivo(Builder $q): Builder {
        return $q->where('status','activo');
    }

}
