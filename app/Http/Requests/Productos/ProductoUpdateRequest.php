<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validacion para actualizar un producto
    public function rules(): array {
        $productoId = $this->route('producto')?->id ?? $this->route('producto');
        return [
            'marca_id' => ['required', 'integer', 'exists:marcas,id'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'sku' => [
                'required', 'string', 'max:80',
                Rule::unique('productos', 'sku')->ignore($productoId),
            ],
            'nombre' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string'],
            'stock' => ['required', 'integer', 'min:0'],
            'costo_lista' => ['required', 'numeric', 'min:0'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            'created_by' => ['prohibited'],
            'updated_by' => ['prohibited'],
            'deleted_by' => ['prohibited'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
