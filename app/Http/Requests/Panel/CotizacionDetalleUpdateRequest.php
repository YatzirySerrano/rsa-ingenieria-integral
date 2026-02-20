<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionDetalleUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return (bool) $this->user();
    }

    protected function prepareForValidation(): void {
        $v = $this->input('cantidad');
        // Normaliza: quita espacios y fuerza string
        $s = is_string($v) ? trim($v) : (string) $v;
        // Solo dígitos (por si llega basura del front)
        $s = preg_replace('/[^\d]/', '', $s) ?? '';
        $this->merge([
            'cantidad' => $s === '' ? null : (int) $s,
        ]);
    }

    public function rules(): array {
        return [
            'cantidad' => ['required', 'integer', 'min:1'],
        ];
    }

}
