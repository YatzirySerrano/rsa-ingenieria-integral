<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionMarkSentRequest extends FormRequest {

    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'channel' => ['required','in:email,whatsapp'],
        ];
    }
    
}