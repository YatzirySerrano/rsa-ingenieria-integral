<?php

namespace App\Http\Requests\Personas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PersonaUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validacion de la actualizacion de una persona
    public function rules(): array {
        return [
            'usuario_id' => ['nullable', 'integer', 'exists:usuarios,id'],

            'nombre' => ['required', 'string', 'max:120'],
            'apellido_paterno' => ['nullable', 'string', 'max:120'],
            'apellido_materno' => ['nullable', 'string', 'max:120'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'empresa' => ['nullable', 'string', 'max:160'],
            'rfc' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string'],

            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
