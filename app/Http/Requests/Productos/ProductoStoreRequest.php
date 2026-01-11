<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;

class ProductoStoreRequest extends FormRequest {
    
    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'marca_id' => ['nullable','integer','exists:marcas,id'],
            'categoria_id' => ['nullable','integer','exists:categorias,id'],
            'sku' => ['required','string','max:80','unique:productos,sku'],
            'nombre' => ['required','string','max:200'],
            'descripcion' => ['nullable','string'],
            'stock' => ['required','integer','min:0'],
            'costo_lista' => ['required','numeric','min:0'],
            'precio_venta' => ['required','numeric','min:0'],
            'status' => ['required','in:activo,inactivo'],
        ];
    }

}
