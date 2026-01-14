<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoStoreRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    // Reglas de validacion para registrar producto
    public function rules(): array {
        return [
            // Marca/Categoría obligatorias para mantener catálogo sano.
            'marca_id' => ['required', 'integer', 'exists:marcas,id'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            // SKU único para evitar duplicados en inventario.
            'sku' => ['required', 'string', 'max:80', Rule::unique('productos', 'sku')],
            'nombre' => ['required', 'string', 'max:160'],
            'descripcion' => ['nullable', 'string'],
            // Stock entero no negativo.
            'stock' => ['required', 'integer', 'min:0'],
            // Precios a 2 decimales (numeric) y no negativos.
            'costo_lista' => ['required', 'numeric', 'min:0'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            // Auditoría: se asigna desde backend.
            'created_by' => ['prohibited'],
            'updated_by' => ['prohibited'],
            'deleted_by' => ['prohibited'],
            'status' => ['nullable', Rule::in(['activo', 'inactivo'])],
        ];
    }

    protected function prepareForValidation(): void {
        // Si no se especifica status, el producto entra visible.
        $this->merge([
            'status' => $this->input('status', 'activo'),
        ]);
    }

}
