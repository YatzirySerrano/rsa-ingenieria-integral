<?php

namespace App\Http\Requests\ProductoMedia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoMediaUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validacion para actualizar un recurso(imagen o video) de un producto
    public function rules(): array {
        return [
            'tipo' => ['required', Rule::in(['imagen', 'video'])],
            'url' => ['required', 'string', 'max:600'],
            'orden' => ['required', 'integer', 'min:0'],
            'principal' => ['required', 'boolean'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
