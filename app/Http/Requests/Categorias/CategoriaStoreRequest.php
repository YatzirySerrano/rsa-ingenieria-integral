<?php

namespace App\Http\Requests\Categorias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoriaStoreRequest extends FormRequest {

    public function authorize(): bool {
        // Reglas de acceso se pueden mover a Policies; por ahora se permite.
        return true;
    }

    // Reglas de validacion para guardar una categoria
    public function rules(): array {
        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('categorias', 'nombre'),
            ],
            // Se usa para separar categorías del catálogo de productos vs servicios.
            'tipo' => ['required', Rule::in(['PRODUCTO', 'SERVICIO'])],
            // Activo/inactivo como “soft delete” empresarial (evita borrar histórico).
            'status' => ['nullable', Rule::in(['activo', 'inactivo'])],
        ];
    }

    protected function prepareForValidation(): void {
        // Si no viene status, se crea activo por defecto para que aparezca en listados.
        $this->merge([
            'status' => $this->input('status', 'activo'),
        ]);
    }

}
