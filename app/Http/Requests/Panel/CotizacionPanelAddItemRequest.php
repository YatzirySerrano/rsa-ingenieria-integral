<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CotizacionPanelAddItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', 'string', Rule::in(['PRODUCTO', 'SERVICIO'])],
            'producto_id' => ['nullable', 'integer', 'min:1'],
            'servicio_id' => ['nullable', 'integer', 'min:1'],
            'cantidad' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $tipo = $this->input('tipo');
            if ($tipo === 'PRODUCTO' && !$this->input('producto_id')) {
                $v->errors()->add('producto_id', 'producto_id es requerido para tipo PRODUCTO.');
            }
            if ($tipo === 'SERVICIO' && !$this->input('servicio_id')) {
                $v->errors()->add('servicio_id', 'servicio_id es requerido para tipo SERVICIO.');
            }
        });
    }
}
