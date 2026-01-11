<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model{

    protected $table = 'categorias';

    protected $fillable = ['nombre', 'tipo', 'status'];

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }

    public function servicios(): HasMany
    {
        return $this->hasMany(Servicio::class, 'categoria_id');
    }

    public function scopeActivo(Builder $q): Builder
    {
        return $q->where('status','activo');
    }

}
