<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionMarkSentRequest extends FormRequest {

    public function authorize(): bool {
        $u = $this->user();
        $rol = $u?->rol;
        return (bool) ($u && in_array($rol, ['admin', 'vendedor'], true));
    }

    public function rules(): array {
        // IMPORTANTE: mark-sent NO requiere payload
        return [];
    }

}
