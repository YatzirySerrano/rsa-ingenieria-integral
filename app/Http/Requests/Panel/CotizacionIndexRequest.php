<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionIndexRequest extends FormRequest {

    public function authorize(): bool { return true; }

    public function rules(): array {
        return [
            'q' => ['nullable','string','max:190'],
            'estatus' => ['nullable','string','max:30'],
            'per_page' => ['nullable','integer','min:5','max:100'],
        ];
    }

}