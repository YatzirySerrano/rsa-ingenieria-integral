<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Http\Requests\Panel\CotizacionAddItemRequest;
use App\Http\Requests\Panel\CotizacionIndexRequest;
use App\Http\Requests\Panel\CotizacionMarkSentRequest;
use App\Http\Requests\Panel\CotizacionPanelStoreRequest;
use App\Http\Requests\Panel\CotizacionReplyRequest;
use App\Http\Requests\Panel\CotizacionSendEmailRequest;
use App\Http\Requests\Panel\CotizacionUpdateRequest;
use App\Mail\CotizacionEnviadaMail;
use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Log;
use App\Models\Producto;
use App\Models\Servicio;
use App\Services\Cotizaciones\CotizacionCreator;
use App\Services\Cotizaciones\CotizacionTotals;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CotizacionPanelController extends Controller {

    public function __construct(private CotizacionTotals $totals) {}

    private function ensurePanelActor(): void {
        $u = auth()->user();
        $rol = $u?->rol;
        abort_unless($u && in_array($rol, ['admin', 'vendedor'], true), 403);
    }

    public function index(CotizacionIndexRequest $request) {
        $this->ensurePanelActor();
        $q = trim((string) $request->input('q', ''));
        $estatus = $request->input('estatus');
        $perPage = (int) ($request->input('per_page') ?: 15);
        $query = Cotizacion::query()
            ->where('status', 'activo')
            ->withSum(['detalles as total_calculado' => fn ($dq) => $dq->where('status', 'activo')], 'total_linea');
        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('folio', 'like', "%{$q}%")
                    ->orWhere('email_destino', 'like', "%{$q}%")
                    ->orWhere('telefono_destino', 'like', "%{$q}%");
            });
        }
        if ($estatus && $estatus !== '__all__') {
            $query->where('estatus', $estatus);
        }
        $items = $query->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (Cotizacion $c) {
                $calc = (float) ($c->total_calculado ?? 0);
                $diff = round(((float) $c->total) - $calc, 2);
                $diff = (abs($diff) >= 0.01) ? $diff : 0;

                return [
                    'id' => $c->id,
                    'folio' => $c->folio,
                    'token' => $c->token,
                    'estatus' => $c->estatus,
                    'email_destino' => $c->email_destino,
                    'telefono_destino' => $c->telefono_destino,
                    'subtotal' => $c->subtotal,
                    'total' => $c->total,
                    'total_calculado' => $calc,
                    'diferencia_total' => $diff,
                    'status' => $c->status,
                    'created_at' => optional($c->created_at)->toISOString(),
                ];
            });
        return Inertia::render('Cotizaciones/Index', [
            'items' => $items,
            'filters' => [
                'q' => $q ?: null,
                'estatus' => $estatus ?: '__all__',
            ],
            'meta' => [
                'estatuses' => ['BORRADOR','EN_REVISION','DEVUELTA','ENVIADA'],
            ],
        ]);
    }

    // NUEVO: pantalla para crear cotización desde panel
    public function create() {
        $this->ensurePanelActor();
        $productos = Producto::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','sku','nombre','precio_venta']);
        $servicios = Servicio::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','nombre','precio']);
        return Inertia::render('Cotizaciones/Create', [
            'meta' => [
                'productos' => $productos,
                'servicios' => $servicios,
            ],
        ]);
    }

    // NUEVO: crea en BD (admin/vendedor)
    public function store(CotizacionPanelStoreRequest $request, CotizacionCreator $creator) {
        $this->ensurePanelActor();
        $cotizacion = $creator->create(
            auth()->id(),
            $request->input('persona_id'),
            $request->input('email_destino'),
            $request->input('telefono_destino'),
            (array) $request->input('items', [])
        );
        $this->log('create', 'cotizacions', $cotizacion->id, 'Creada desde panel.');
        return redirect()->route('cotizaciones.show', ['cotizacion' => $cotizacion->id], 303);
    }

    public function show(Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $cotizacion->load([
            'detalles' => fn ($q) => $q->orderBy('id')->where('status','activo')->with(['producto','servicio']),
        ]);
        return Inertia::render('Cotizaciones/Show', [
            'item' => [
                'id' => $cotizacion->id,
                'folio' => $cotizacion->folio,
                'token' => $cotizacion->token,
                'estatus' => $cotizacion->estatus,
                'email_destino' => $cotizacion->email_destino,
                'telefono_destino' => $cotizacion->telefono_destino,
                'subtotal' => $cotizacion->subtotal,
                'total' => $cotizacion->total,
                'status' => $cotizacion->status,
                'detalles' => $cotizacion->detalles->map(fn ($d) => [
                    'id' => $d->id,
                    'producto_id' => $d->producto_id,
                    'servicio_id' => $d->servicio_id,
                    'cantidad' => $d->cantidad,
                    'precio_unitario' => $d->precio_unitario,
                    'total_linea' => $d->total_linea,
                    'status' => $d->status,
                    'producto' => $d->producto ? [
                        'id' => $d->producto->id,
                        'sku' => $d->producto->sku,
                        'nombre' => $d->producto->nombre,
                    ] : null,
                    'servicio' => $d->servicio ? [
                        'id' => $d->servicio->id,
                        'nombre' => $d->servicio->nombre,
                    ] : null,
                ])->values(),
            ],
            'meta' => [
                'estatuses' => ['BORRADOR','EN_REVISION','DEVUELTA','ENVIADA'],
            ],
        ]);
    }

    public function update(CotizacionUpdateRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $cotizacion->fill($request->only(['email_destino','telefono_destino','estatus']));
        if (!$cotizacion->estatus) $cotizacion->estatus = 'EN_REVISION';
        $cotizacion->save();
        $this->log('update', 'cotizacions', $cotizacion->id, 'Update cabecera/estatus.');
        return back(303);
    }

    public function destroy(Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $cotizacion->status = 'inactivo';
        $cotizacion->save();
        $this->log('delete', 'cotizacions', $cotizacion->id, 'Baja lógica.');
        return redirect()->route('cotizaciones.index', [], 303);
    }

    public function addItem(CotizacionAddItemRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $tipo = $request->input('tipo');
        $cantidad = (float) $request->input('cantidad');
        $productoId = $tipo === 'PRODUCTO' ? (int) $request->input('producto_id') : null;
        $servicioId = $tipo === 'SERVICIO' ? (int) $request->input('servicio_id') : null;
        $precio = 0.0;
        if ($tipo === 'PRODUCTO') {
            $p = Producto::where('id', $productoId)->where('status','activo')->firstOrFail();
            $precio = (float) $p->precio_venta;
        } else {
            $s = Servicio::where('id', $servicioId)->where('status','activo')->firstOrFail();
            $precio = (float) $s->precio;
        }
        $detalle = CotizacionDetalle::query()
            ->where('cotizacion_id', $cotizacion->id)
            ->where('status','activo')
            ->when($productoId, fn ($q) => $q->where('producto_id',$productoId)->whereNull('servicio_id'))
            ->when($servicioId, fn ($q) => $q->where('servicio_id',$servicioId)->whereNull('producto_id'))
            ->first();
        if ($detalle) {
            $detalle->cantidad = (float) $detalle->cantidad + $cantidad;
            $detalle->precio_unitario = $precio;
            $detalle->total_linea = round(((float) $detalle->cantidad) * $precio, 2);
            $detalle->save();
        } else {
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
        if ($cotizacion->estatus === 'BORRADOR') {
            $cotizacion->estatus = 'EN_REVISION';
            $cotizacion->save();
        }
        $this->totals->recalc($cotizacion);
        $this->log('create', 'cotizacion_detalles', $cotizacion->id, 'Add item.');
        return back(303);
    }

    public function reply(CotizacionReplyRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $cotizacion->fill($request->only(['email_destino','telefono_destino']));
        $cotizacion->estatus = 'DEVUELTA';
        $cotizacion->save();
        $this->log('update', 'cotizacions', $cotizacion->id, 'Marcada DEVUELTA.');
        return back(303);
    }

    // OJO: este NO manda correo. Es para cuando tú ya la mandaste por WhatsApp y solo quieres marcar.
    public function markSent(CotizacionMarkSentRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $cotizacion->estatus = 'ENVIADA';
        $cotizacion->save();
        $this->log('update', 'cotizacions', $cotizacion->id, 'Marcada ENVIADA (manual).');
        return back(303);
    }

    // NUEVO: manda correo desde el sistema y marca ENVIADA
    public function sendEmail(CotizacionSendEmailRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $email = trim((string) ($request->input('email') ?: $cotizacion->email_destino));
        abort_unless($email !== '', 422);
        $url = route('cotizacion.public.show', ['token' => $cotizacion->token]);
        Mail::to($email)->send(new CotizacionEnviadaMail($cotizacion->fresh(), $url));
        $cotizacion->estatus = 'ENVIADA';
        $cotizacion->save();
        $this->log('update', 'cotizacions', $cotizacion->id, 'Enviada por correo (sistema).');
        return back(303);
    }

    private function log(string $accion, string $tabla, ?int $registroId, ?string $detalle): void {
        Log::create([
            'usuario_id' => auth()->id(),
            'accion' => Str::limit($accion, 30, ''),
            'tabla' => Str::limit($tabla, 80, ''),
            'registro_id' => $registroId,
            'detalle' => $detalle ? Str::limit($detalle, 255, '') : null,
            'status' => 'activo',
        ]);
    }

}
