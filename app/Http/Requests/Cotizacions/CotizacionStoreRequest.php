<?php

namespace App\Http\Requests\Cotizacions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CotizacionStoreRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validación para guardar una cotización
    public function rules(): array {
        return [
            // Se liga a usuario y opcionalmente a persona (cliente).
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'persona_id' => ['nullable', 'integer', 'exists:personas,id'],
            // Folio/token se generan si no vienen (para evitar colisiones y asegurar trazabilidad).
            'folio' => ['nullable', 'string', 'max:50'],
            'token' => ['nullable', 'string', 'max:80'],
            // Estatus de negocio; inicia BORRADOR.
            'estatus' => ['nullable', Rule::in(['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'])],
            // Datos destino para envío (correo/whatsapp).
            'email_destino' => ['nullable', 'email', 'max:150'],
            'telefono_destino' => ['nullable', 'string', 'max:30'],
            // Totales NO se aceptan desde UI: se calculan con detalles.
            'subtotal' => ['prohibited'],
            'total' => ['prohibited'],
            'status' => ['nullable', Rule::in(['activo', 'inactivo'])],
        ];
    }

    protected function prepareForValidation(): void {
        $this->merge([
            'estatus' => $this->input('estatus', 'BORRADOR'),
            'status' => $this->input('status', 'activo'),
        ]);
    }

}
