<?php

namespace App\Http\Requests\Personas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PersonaStoreRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validacion para el registro de una persona
    public function rules(): array {
        return [
            // Se puede ligar a usuario interno, pero no es obligatorio.
            'usuario_id' => ['nullable', 'integer', 'exists:usuarios,id'],
            'nombre' => ['required', 'string', 'max:120'],
            'apellido_paterno' => ['nullable', 'string', 'max:120'],
            'apellido_materno' => ['nullable', 'string', 'max:120'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'empresa' => ['nullable', 'string', 'max:160'],
            'rfc' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['activo', 'inactivo'])],
        ];
    }

    protected function prepareForValidation(): void {
        $this->merge([
            'status' => $this->input('status', 'activo'),
        ]);
    }

}
