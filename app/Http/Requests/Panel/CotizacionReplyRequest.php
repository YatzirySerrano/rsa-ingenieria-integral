<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionReplyRequest extends FormRequest {

    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'email_destino' => ['nullable','email','max:190'],
            'telefono_destino' => ['nullable','string','max:30'],
        ];
    }

}
