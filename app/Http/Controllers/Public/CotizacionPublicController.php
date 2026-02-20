<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\CotizacionGuestStoreRequest;
use App\Models\Cotizacion;
use App\Models\Producto;
use App\Models\Servicio;
use App\Services\Cotizaciones\CotizacionCreator;
use Inertia\Inertia;

class CotizacionPublicController extends Controller {

    public function create() {
        $productos = Producto::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','sku','nombre','precio_venta']);
        $servicios = Servicio::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','nombre','precio']);
        return Inertia::render('Cotizaciones/GuestCreate', [
            'meta' => [
                'productos' => $productos,
                'servicios' => $servicios,
            ],
        ]);
    }

    public function store(CotizacionGuestStoreRequest $request, CotizacionCreator $creator) {
        $cotizacion = $creator->create(
            auth()->id(),
            null,
            $request->input('email_destino'),
            $request->input('telefono_destino'),
            (array) $request->input('items', [])
        );
        return redirect()->route('cotizacion.public.show', ['token' => $cotizacion->token], 303);
    }

    public function show(string $token) {
        $cotizacion = Cotizacion::query()
            ->where('token', $token)
            ->where('status','activo')
            ->firstOrFail();
        $cotizacion->load([
            'detalles' => fn ($q) => $q->orderBy('id')->where('status','activo')->with(['producto','servicio']),
        ]);
        return Inertia::render('Cotizaciones/GuestShow', [
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
