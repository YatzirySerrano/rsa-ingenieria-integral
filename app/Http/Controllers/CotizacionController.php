<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cotizacions\CotizacionAddItemRequest;
use App\Http\Requests\Cotizacions\CotizacionSendRequest;
use App\Http\Requests\Cotizacions\CotizacionStoreRequest;
use App\Http\Requests\Cotizacions\CotizacionUpdateRequest;
use App\Http\Resources\CotizacionResource;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Producto;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionController extends Controller {

    // Metodo para filtrar cotizaciones por nombre, estatus y status.
    public function index(Request $request): Response {
        // Listado con filtros para panel Inertia.
        $q = trim((string) $request->get('q', ''));
        $estatus = $request->get('estatus');
        $status = $request->get('status');
        $items = Cotizacion::query()
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where('folio', 'like', "%{$q}%")
                  ->orWhere('email_destino', 'like', "%{$q}%")
                  ->orWhere('telefono_destino', 'like', "%{$q}%");
            })
            ->when($estatus, fn ($qr) => $qr->where('estatus', $estatus))
            ->when($status, fn ($qr) => $qr->where('status', $status))
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();
        return Inertia::render('Cotizaciones/Index', [
            'items' => CotizacionResource::collection($items),
            'filters' => [
                'q' => $q,
                'estatus' => $estatus,
                'status' => $status,
            ],
            'meta' => [
                'estatuses' => ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'],
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    // Metodo para mostrar la pantalla de alta de una cotización.
    public function create(): Response {
        // Pantalla de creación: aquí se pueden inyectar catálogos (personas, etc.) si se necesita.
        return Inertia::render('Cotizaciones/Create', [
            'meta' => [
                'estatuses' => ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'],
                'statuses' => ['activo', 'inactivo'],
            ],
        ]);
    }

    // Metodo para registrar una cotización.
    public function store(CotizacionStoreRequest $request) {
        $data = $request->validated();
        $cotizacion = Cotizacion::create([
            ...$data,
            'usuario_id' => auth()->id(), // aquí va el dueño real
            'token' => $data['token'] ?? (string) Str::uuid(),
            'folio' => $data['folio'] ?? $this->generateFolio(),
            'estatus' => $data['estatus'] ?? 'BORRADOR',
            'subtotal' => 0,
            'total' => 0,
            'status' => $data['status'] ?? 'activo',
        ]);
        return redirect()
            ->route('cotizaciones.edit', $cotizacion)
            ->with('success', 'Cotización creada. Se pueden agregar productos/servicios.');
    }

    // Metodo para mostrar la pantalla de edición de una cotización.
    public function edit(Cotizacion $cotizacion): Response {
        // Edit se usa como “workspace”: muestra cabecera + detalles y acciones (addItem, send).
        $cotizacion->load([
            'detalles.producto',
            'detalles.servicio',
        ]);

        return Inertia::render('Cotizaciones/Edit', [
            'item' => new CotizacionResource($cotizacion),
            'meta' => [
                'estatuses' => ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'],
                'statuses' => ['activo', 'inactivo'],
                'tipos_item' => ['PRODUCTO', 'SERVICIO'],
            ],
        ]);
    }

    // Metodo para actualizar una cotización.
    public function update(CotizacionUpdateRequest $request, Cotizacion $cotizacion) {
        // Actualiza cabecera (persona, estatus, destino, status). Totales siempre se recalculan.
        $cotizacion->update($request->validated());
        $this->recalcularTotales($cotizacion);
        return redirect()
            ->route('cotizaciones.edit', $cotizacion)
            ->with('success', 'Cotización actualizada.');
    }

    // Metodo de eliminación logica
    public function destroy(Cotizacion $cotizacion)
    {
        // Se inactiva en lugar de borrar.
        $cotizacion->update(['status' => 'inactivo']);
        return redirect()
            ->route('cotizaciones.index')
            ->with('success', 'Cotización desactivada.');
    }

    // Metodo de agregar un detalle a una cotización.
    public function addItem(CotizacionAddItemRequest $request, Cotizacion $cotizacion) {
        // Agrega una línea a la cotización, tomando el precio actual del producto/servicio.
        $data = $request->validated();
        $cantidad = (float) $data['cantidad'];
        $productoId = $data['producto_id'] ?? null;
        $servicioId = $data['servicio_id'] ?? null;
        $precio = 0.0;
        if ($data['tipo'] === 'PRODUCTO') {
            $producto = Producto::findOrFail($productoId);
            $precio = (float) ($producto->precio ?? 0);
        } else {
            $servicio = Servicio::findOrFail($servicioId);
            $precio = (float) ($servicio->precio ?? 0);
        }
        CotizacionDetalle::create([
            'cotizacion_id' => $cotizacion->id,
            'producto_id' => $productoId,
            'servicio_id' => $servicioId,
            'cantidad' => $cantidad,
            'precio_unitario' => $precio,
            'total_linea' => round($cantidad * $precio, 2),
            'status' => 'activo',
        ]);
        $this->recalcularTotales($cotizacion);
        return redirect()
            ->route('cotizaciones.edit', $cotizacion)
            ->with('success', 'Ítem agregado a la cotización.');
    }

    // Metodo para enviar una cotización.
    public function send(CotizacionSendRequest $request, Cotizacion $cotizacion) {
        // Marca como ENVIADA y guarda datos destino. Aquí es donde después se integra mail/whatsapp.
        $cotizacion->update([
            ...$request->validated(),
            'estatus' => 'ENVIADA',
        ]);
        $this->recalcularTotales($cotizacion);
        return redirect()
            ->route('cotizaciones.edit', $cotizacion)
            ->with('success', 'Cotización marcada como ENVIADA.');
    }

    // Metodo para generar un folio único.
    private function generateFolio(): string {
        // Folio legible y único sin depender de secuencias frágiles.
        return 'COT-' . now()->format('Ymd') . '-' . str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
    }

    // Metodo para recalcular totales de una cotización.
    private function recalcularTotales(Cotizacion $cotizacion): void {
        // Subtotal = suma de total_linea de detalles activos. Total = subtotal (sin impuestos aún).
        $subtotal = (float) CotizacionDetalle::query()
            ->where('cotizacion_id', $cotizacion->id)
            ->where('status', 'activo')
            ->sum('total_linea');
        $cotizacion->update([
            'subtotal' => round($subtotal, 2),
            'total' => round($subtotal, 2),
        ]);
    }

}
