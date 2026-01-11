<?php

namespace App\Http\Requests\Cotizacions;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionAddItemRequest extends FormRequest {
   
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'tipo' => ['required','in:PRODUCTO,SERVICIO'],
            'producto_id' => ['nullable','integer','exists:productos,id'],
            'servicio_id' => ['nullable','integer','exists:servicios,id'],
            'cantidad' => ['required','numeric','min:0.01'],
        ];
    }

}
