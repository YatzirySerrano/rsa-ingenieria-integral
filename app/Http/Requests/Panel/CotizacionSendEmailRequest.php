<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionSendEmailRequest extends FormRequest {

    public function authorize(): bool {
        return auth()->check();
    }

    public function rules(): array {
        return [
            // Permite override opcional; si viene vacío se usa cotizacion.email_destino
            'email' => ['nullable', 'email', 'max:150'],
        ];
    }

}
