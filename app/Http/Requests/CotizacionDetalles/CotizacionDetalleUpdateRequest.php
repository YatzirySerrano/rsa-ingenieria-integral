<?php

namespace App\Http\Requests\CotizacionDetalles;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionDetalleUpdateRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para actualizar un detalle de cotización
    public function rules(): array {
        return [
            // Permite editar cantidad/precio y recalcular la línea.
            'cantidad' => ['required', 'numeric', 'min:0.01'],
            'precio_unitario' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:activo,inactivo'],
        ];
    }

}
