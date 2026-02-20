<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionPanelIndexRequest extends FormRequest {

    public function authorize(): bool {
        return auth()->check();
    }

    public function rules(): array {
        return [
            'q' => ['nullable', 'string', 'max:120'],
            'estatus' => ['nullable', 'string', 'max:40'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ];
    }

}
