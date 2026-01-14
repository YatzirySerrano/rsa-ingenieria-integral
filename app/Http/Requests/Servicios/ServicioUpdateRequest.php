<?php

namespace App\Http\Requests\Servicios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServicioUpdateRequest extends FormRequest {
    
    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para actualizar servicio
    public function rules(): array {
        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'nombre' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string'],
            'precio' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
