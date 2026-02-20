<?php

namespace App\Models;

use App\Models\Marca;
use App\Models\Categoria;
use App\Models\ProductoMedia;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Producto extends Model {

    protected $table = 'productos';

    // Si prefieres: protected $guarded = [];
    protected $fillable = [
        'marca_id',
        'categoria_id',
        'sku',
        'nombre',
        'descripcion',
        'stock',
        'costo_lista',
        'precio_venta',
        'created_by',
        'updated_by',
        'deleted_by',
        'status',
    ];

    protected $casts = [
        'stock' => 'integer',
        'costo_lista' => 'decimal:2',
        'precio_venta' => 'decimal:2',
    ];

    public function marca(): BelongsTo {
        return $this->belongsTo(Marca::class, 'marca_id');
    }

    public function categoria(): BelongsTo {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function medias(): HasMany {
        return $this->hasMany(ProductoMedia::class, 'producto_id')
            ->orderBy('orden');
    }

    public function scopeActivo($query) {
        return $query->where('status', 'activo');
    }


    // Opcional: si quieres también un scope para inactivos
    public function scopeInactivo(Builder $query): Builder {
        return $query->where('status', 'inactivo');
    }

}
