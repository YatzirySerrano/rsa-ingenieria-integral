<?php

namespace App\Http\Requests\Marcas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MarcaStoreRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para guardar una marca
    public function rules(): array {
        return [
            // Nombre único para evitar duplicados en catálogos y filtros.
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('marcas', 'nombre'),
            ],
            'status' => ['nullable', Rule::in(['activo', 'inactivo'])],
        ];
    }

    protected function prepareForValidation(): void {
        // Por defecto todo nuevo entra activo.
        $this->merge([
            'status' => $this->input('status', 'activo'),
        ]);
    }

}
