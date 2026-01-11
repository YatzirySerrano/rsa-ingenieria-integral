<?php

namespace App\Http\Requests\ProductoMedia;

use Illuminate\Foundation\Http\FormRequest;

class ProductoMediaStoreRequest extends FormRequest {

    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'tipo' => ['required','in:imagen,video'],
            'url' => ['required','url','max:2048'],
            'orden' => ['nullable','integer','min:1'],
            'principal' => ['nullable','boolean'],
            'status' => ['required','in:activo,inactivo'],
        ];
    }

}
