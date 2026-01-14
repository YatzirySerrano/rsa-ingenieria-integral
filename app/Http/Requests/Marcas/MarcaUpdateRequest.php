<?php

namespace App\Http\Requests\Marcas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MarcaUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para actualizar una marca
    public function rules(): array {
        $marcaId = $this->route('marca')?->id ?? $this->route('marca');
        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('marcas', 'nombre')->ignore($marcaId),
            ],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
