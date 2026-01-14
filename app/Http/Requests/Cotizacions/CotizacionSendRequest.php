<?php

namespace App\Http\Requests\Cotizacions;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionSendRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para enviar una cotización
    public function rules(): array {
        // Para “enviar”, mínimo un correo. Teléfono opcional.
        return [
            'email_destino' => ['required', 'email', 'max:150'],
            'telefono_destino' => ['nullable', 'string', 'max:30'],
        ];
    }

}
