<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cotizacions\CotizacionAddItemRequest;
use App\Http\Requests\Cotizacions\CotizacionSendRequest;
use App\Http\Resources\CotizacionResource;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Producto;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CotizacionsController extends Controller
{
    public function show(Request $request, Cotizacion $cotizacion)
    {
        $cotizacion->load([
            'detalles.producto',
            'detalles.servicio',
        ]);

        return Inertia::render('cotizacions/Show', [
            'cotizacion' => CotizacionResource::make($cotizacion),
        ]);
    }

    public function createDraft(Request $request)
    {
        $token = (string) Str::uuid();
        $folio = 'COT-' . date('Y') . '-' . str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);

        $cotizacion = Cotizacion::create([
            'usuario_id' => auth()->id(),
            'persona_id' => null,
            'folio' => $folio,
            'token' => $token,
            'estatus' => 'BORRADOR',
            'subtotal' => 0,
            'total' => 0,
            'status' => 'activo',
        ]);

        return redirect()->route('cotizacions.show', $cotizacion);
    }

    public function addItem(CotizacionAddItemRequest $request, Cotizacion $cotizacion)
    {
        $data = $request->validated();

        DB::transaction(function () use ($cotizacion, $data) {
            $cantidad = (float) $data['cantidad'];

            if ($data['tipo'] === 'PRODUCTO') {
                $producto = Producto::query()->activo()->findOrFail((int) $data['producto_id']);
                $precio = (float) $producto->precio_venta;

                $detalle = CotizacionDetalle::query()
                    ->where('cotizacion_id', $cotizacion->id)
                    ->where('producto_id', $producto->id)
                    ->whereNull('servicio_id')
                    ->where('status','activo')
                    ->first();

                if ($detalle) {
                    $detalle->cantidad = (float) $detalle->cantidad + $cantidad;
                    $detalle->precio_unitario = $precio;
                    $detalle->total_linea = $detalle->cantidad * $precio;
                    $detalle->save();
                } else {
                    CotizacionDetalle::create([
                        'cotizacion_id' => $cotizacion->id,
                        'producto_id' => $producto->id,
                        'servicio_id' => null,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precio,
                        'total_linea' => $cantidad * $precio,
                        'status' => 'activo',
                    ]);
                }
            }

            if ($data['tipo'] === 'SERVICIO') {
                $servicio = Servicio::query()->activo()->findOrFail((int) $data['servicio_id']);
                $precio = (float) $servicio->precio;

                $detalle = CotizacionDetalle::query()
                    ->where('cotizacion_id', $cotizacion->id)
                    ->where('servicio_id', $servicio->id)
                    ->whereNull('producto_id')
                    ->where('status','activo')
                    ->first();

                if ($detalle) {
                    $detalle->cantidad = (float) $detalle->cantidad + $cantidad;
                    $detalle->precio_unitario = $precio;
                    $detalle->total_linea = $detalle->cantidad * $precio;
                    $detalle->save();
                } else {
                    CotizacionDetalle::create([
                        'cotizacion_id' => $cotizacion->id,
                        'producto_id' => null,
                        'servicio_id' => $servicio->id,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precio,
                        'total_linea' => $cantidad * $precio,
                        'status' => 'activo',
                    ]);
                }
            }

            $this->recalcularTotales($cotizacion);
        });

        return back()->with('success','Item agregado a la cotización.');
    }

    public function removeItem(Request $request, Cotizacion $cotizacion, CotizacionDetalle $detalle)
    {
        if ((int) $detalle->cotizacion_id !== (int) $cotizacion->id) {
            abort(404);
        }

        DB::transaction(function () use ($cotizacion, $detalle) {
            $detalle->update(['status' => 'inactivo']);
            $this->recalcularTotales($cotizacion);
        });

        return back()->with('success','Item removido.');
    }

    public function send(CotizacionSendRequest $request, Cotizacion $cotizacion)
    {
        $cotizacion->update([
            'email_destino' => $request->email_destino,
            'telefono_destino' => $request->telefono_destino,
            'estatus' => 'ENVIADA',
        ]);

        // Aquí engancha tu Mail::to()->send(new CotizacionMail($cotizacion))
        // y registra en logs.

        return back()->with('success','Cotización marcada como ENVIADA (pendiente de envío por correo).');
    }

    private function recalcularTotales(Cotizacion $cotizacion): void
    {
        $sum = CotizacionDetalle::query()
            ->where('cotizacion_id', $cotizacion->id)
            ->where('status','activo')
            ->sum('total_linea');

        $cotizacion->update([
            'subtotal' => $sum,
            'total' => $sum,
        ]);
    }

}
