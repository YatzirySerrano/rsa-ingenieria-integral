<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CotizacionPanelUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return auth()->check();
    }

    public function rules(): array {
        return [
            'email_destino' => ['nullable', 'email', 'max:190'],
            'telefono_destino' => ['nullable', 'string', 'max:30'],
            'estatus' => ['nullable', 'string', Rule::in(['BORRADOR','EN_REVISION','DEVUELTA','ENVIADA'])],
        ];
    }

}
