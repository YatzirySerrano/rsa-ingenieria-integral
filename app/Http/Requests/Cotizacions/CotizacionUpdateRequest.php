<?php

namespace App\Http\Requests\Cotizacions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CotizacionUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para actualizar una cotización
    public function rules(): array {
        return [
            'persona_id' => ['nullable', 'integer', 'exists:personas,id'],
            'estatus' => ['required', Rule::in(['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZAZADA', 'RECHAZADA', 'CANCELADA'])],
            'email_destino' => ['nullable', 'email', 'max:150'],
            'telefono_destino' => ['nullable', 'string', 'max:30'],
            'subtotal' => ['prohibited'],
            'total' => ['prohibited'],
            'status' => ['required', Rule::in(['activo', 'inactivo'])],
        ];
    }

}
