<?php

namespace App\Http\Requests\Cotizacions;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionSendRequest extends FormRequest {
    
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email_destino' => ['required','email','max:190'],
            'telefono_destino' => ['nullable','string','max:30'],
        ];
    }

}
