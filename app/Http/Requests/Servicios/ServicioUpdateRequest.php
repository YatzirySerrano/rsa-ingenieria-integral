<?php

namespace App\Http\Requests\Servicios;

use Illuminate\Foundation\Http\FormRequest;

class ServicioUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'categoria_id' => ['nullable','integer','exists:categorias,id'],
            'nombre' => ['required','string','max:200'],
            'descripcion' => ['nullable','string'],
            'precio' => ['required','numeric','min:0'],
            'status' => ['required','in:activo,inactivo'],
        ];
    }
}
