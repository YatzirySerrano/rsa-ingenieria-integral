<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionGuestStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email_destino' => ['nullable','email','max:190'],
            'telefono_destino' => ['nullable','string','max:30'],

            'items' => ['required','array','min:1'],
            'items.*.tipo' => ['required','in:PRODUCTO,SERVICIO'],
            'items.*.producto_id' => ['nullable','integer'],
            'items.*.servicio_id' => ['nullable','integer'],
            'items.*.cantidad' => ['required','numeric','min:0.01'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $email = trim((string) $this->input('email_destino',''));
            $tel = trim((string) $this->input('telefono_destino',''));
            if ($email === '' && $tel === '') {
                $v->errors()->add('contacto', 'Captura al menos correo o teléfono.');
            }
        });
    }
}