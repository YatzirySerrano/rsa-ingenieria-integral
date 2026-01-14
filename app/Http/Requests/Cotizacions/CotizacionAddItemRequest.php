<?php

namespace App\Http\Requests\Cotizacions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CotizacionAddItemRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para agregar un detalle a una cotización
    public function rules(): array {
        return [
            // Define si el detalle se liga a producto o servicio.
            'tipo' => ['required', Rule::in(['PRODUCTO', 'SERVICIO'])],
            // Un producto_id es obligatorio si tipo=PRODUCTO.
            'producto_id' => [
                'nullable',
                'integer',
                'exists:productos,id',
                Rule::requiredIf(fn () => $this->input('tipo') === 'PRODUCTO'),
            ],
            // Un servicio_id es obligatorio si tipo=SERVICIO.
            'servicio_id' => [
                'nullable',
                'integer',
                'exists:servicios,id',
                Rule::requiredIf(fn () => $this->input('tipo') === 'SERVICIO'),
            ],
            // Cantidad mínima para que no existan líneas “fantasma”.
            'cantidad' => ['required', 'numeric', 'min:0.01'],
        ];
    }

}
