<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        $id = $this->route('producto')?->id ?? null;

        return [
            'marca_id' => ['required', 'integer', 'exists:marcas,id'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('productos', 'sku')->ignore($id)],
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
        return (new ProductoStoreRequest())->messages();
    }

}
