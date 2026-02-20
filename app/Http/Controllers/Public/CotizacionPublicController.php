<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\CotizacionGuestStoreRequest;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Producto;
use App\Models\Servicio;
use App\Services\Cotizaciones\CotizacionTotals;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CotizacionPublicController extends Controller {

    public function __construct(private CotizacionTotals $totals) {}

    public function create()
    {
        // Catálogo mínimo para guest (sin inventar nada)
        $productos = Producto::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','sku','nombre','precio_venta']);

        $servicios = Servicio::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','nombre','precio']);

        return Inertia::render('cotizaciones/GuestCreate', [
            'meta' => [
                'productos' => $productos,
                'servicios' => $servicios,
            ],
        ]);
    }

    public function store(CotizacionGuestStoreRequest $request)
    {
        $token = (string) Str::uuid();

        $cotizacion = Cotizacion::create([
            'usuario_id' => auth()->id(),
            'persona_id' => null,
            'folio' => 'TMP',
            'token' => $token,
            'estatus' => 'BORRADOR',
            'email_destino' => $request->input('email_destino'),
            'telefono_destino' => $request->input('telefono_destino'),
            'subtotal' => 0,
            'total' => 0,
            'status' => 'activo',
        ]);

        $folio = 'COT-' . now()->format('Ymd') . '-' . str_pad((string)$cotizacion->id, 5, '0', STR_PAD_LEFT);
        $cotizacion->folio = $folio;
        $cotizacion->save();

        foreach ($request->input('items', []) as $it) {
            $tipo = $it['tipo'];
            $cantidad = (float) $it['cantidad'];

            $productoId = $tipo === 'PRODUCTO' ? (int) ($it['producto_id'] ?? 0) : null;
            $servicioId = $tipo === 'SERVICIO' ? (int) ($it['servicio_id'] ?? 0) : null;

            $precio = 0.0;
            if ($tipo === 'PRODUCTO') {
                $p = Producto::where('id',$productoId)->where('status','activo')->firstOrFail();
                $precio = (float) $p->precio_venta;
            } else {
                $s = Servicio::where('id',$servicioId)->where('status','activo')->firstOrFail();
                $precio = (float) $s->precio;
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
        }

        $this->totals->recalc($cotizacion);

        return redirect()->route('cotizacion.public.show', ['token' => $token], 303);
    }

    public function show(string $token)
    {
        $cotizacion = Cotizacion::query()
            ->where('token', $token)
            ->where('status','activo')
            ->firstOrFail();

        $cotizacion->load([
            'detalles' => fn ($q) => $q->orderBy('id')->where('status','activo')->with(['producto','servicio']),
        ]);

        return Inertia::render('cotizaciones/GuestShow', [
            'item' => [
                'folio' => $cotizacion->folio,
                'token' => $cotizacion->token,
                'estatus' => $cotizacion->estatus,
                'email_destino' => $cotizacion->email_destino,
                'telefono_destino' => $cotizacion->telefono_destino,
                'subtotal' => $cotizacion->subtotal,
                'total' => $cotizacion->total,
                'detalles' => $cotizacion->detalles->map(fn ($d) => [
                    'id' => $d->id,
                    'cantidad' => $d->cantidad,
                    'precio_unitario' => $d->precio_unitario,
                    'total_linea' => $d->total_linea,
                    'producto' => $d->producto ? ['sku'=>$d->producto->sku,'nombre'=>$d->producto->nombre] : null,
                    'servicio' => $d->servicio ? ['nombre'=>$d->servicio->nombre] : null,
                ])->values(),
            ],
        ]);
    }

}