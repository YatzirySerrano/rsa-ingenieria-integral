<?php

namespace App\Http\Requests\Panel;

use Illuminate\Foundation\Http\FormRequest;

class CotizacionPanelStoreRequest extends FormRequest {

    public function authorize(): bool {
        return auth()->check();
    }

    public function rules(): array {
        return [
            'email_destino' => ['nullable', 'email', 'max:150'],
            'telefono_destino' => ['nullable', 'string', 'max:30'],
            'persona_id' => ['nullable', 'integer'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.tipo' => ['required', 'in:PRODUCTO,SERVICIO'],
            'items.*.cantidad' => ['required', 'numeric', 'min:0.01'],
            'items.*.producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'items.*.servicio_id' => ['nullable', 'integer', 'exists:servicios,id'],
        ];
    }

    public function withValidator($validator): void {
        $validator->after(function ($v) {
            $items = (array) $this->input('items', []);
            foreach ($items as $i => $it) {
                $tipo = strtoupper((string) ($it['tipo'] ?? ''));
                if ($tipo === 'PRODUCTO' && empty($it['producto_id'])) {
                    $v->errors()->add("items.$i.producto_id", 'producto_id es requerido cuando tipo=PRODUCTO.');
                }
                if ($tipo === 'SERVICIO' && empty($it['servicio_id'])) {
                    $v->errors()->add("items.$i.servicio_id", 'servicio_id es requerido cuando tipo=SERVICIO.');
                }
            }
            $email = trim((string) $this->input('email_destino', ''));
            $tel = trim((string) $this->input('telefono_destino', ''));
            if ($email === '' && $tel === '') {
                $v->errors()->add('email_destino', 'Captura al menos correo o teléfono.');
            }
        });
    }

}
