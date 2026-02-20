<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionUpdateRequest extends FormRequest {

    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'email_destino' => ['nullable','email','max:190'],
            'telefono_destino' => ['nullable','string','max:30'],
            'estatus' => ['nullable','string','max:20'],
        ];
    }

}
