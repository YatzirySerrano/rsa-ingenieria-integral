<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoStoreRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'marca_id' => ['required', 'integer', 'exists:marcas,id'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'sku' => ['required', 'string', 'max:80', 'unique:productos,sku'],
            'nombre' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'stock' => ['required', 'integer', 'min:0'],
            'costo_lista' => ['required', 'numeric', 'min:0'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],

            'fotos' => ['sometimes', 'array'],
            'fotos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    public function messages(): array {
        return [
            'marca_id.required' => 'Selecciona una marca.',
            'marca_id.exists' => 'La marca seleccionada no existe.',
            'categoria_id.required' => 'Selecciona una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'sku.required' => 'El SKU es obligatorio.',
            'sku.unique' => 'Ese SKU ya está registrado.',
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
            'costo_lista.required' => 'El costo lista es obligatorio.',
            'costo_lista.numeric' => 'El costo lista debe ser numérico.',
            'precio_venta.required' => 'El precio de venta es obligatorio.',
            'precio_venta.numeric' => 'El precio de venta debe ser numérico.',
            'status.required' => 'El estado es obligatorio.',
            'status.in' => 'El estado debe ser activo o inactivo.',
            'fotos.array' => 'Las fotos deben enviarse como lista.',
            'fotos.*.image' => 'Cada archivo debe ser una imagen.',
            'fotos.*.mimes' => 'Formatos permitidos: jpg, jpeg, png, webp.',
            'fotos.*.max' => 'Cada imagen debe pesar máximo 4MB.',
        ];
    }

}
