<?php

namespace App\Http\Requests\Categorias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoriaUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validacion para actualizar una categoria
    public function rules(): array {
        $categoriaId = $this->route('categoria')?->id ?? $this->route('categoria');
        return [
            // Misma validación que store, pero ignorando el propio registro.
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('categorias', 'nombre')->ignore($categoriaId),
            ],
            'tipo' => ['required', Rule::in(['PRODUCTO', 'SERVICIO'])],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
