<?php

namespace App\Http\Requests\Servicios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServicioStoreRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para registrar servicio
    public function rules(): array {
        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'nombre' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string'],
            'precio' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', Rule::in(['activo', 'inactivo'])],
        ];
    }

    protected function prepareForValidation(): void {
        $this->merge([
            'status' => $this->input('status', 'activo'),
        ]);
    }

}
