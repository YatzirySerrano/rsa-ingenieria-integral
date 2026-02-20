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
use App\Models\Log as LogModel;
use App\Models\Producto;
use App\Models\Servicio;
use Illuminate\Support\Facades\Log as LaravelLog;
use App\Services\Cotizaciones\CotizacionCreator;
use App\Services\Cotizaciones\CotizacionTotals;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $toPublic = fn (?string $path) => $path ? '/storage/' . ltrim($path, '/') : null;
        $productos = Producto::query()
            ->where('status','activo')
            ->with(['medias' => fn($q) => $q->where('status','activo')->orderByDesc('principal')->orderBy('orden')])
            ->orderBy('nombre')
            ->get(['id','sku','nombre','precio_venta'])
            ->map(function (Producto $p) use ($toPublic) {
                $imgPath =
                    $p->medias->firstWhere('principal', 1)?->url
                    ?: $p->medias->first()?->url;
                return [
                    'id' => $p->id,
                    'sku' => $p->sku,
                    'nombre' => $p->nombre,
                    'precio_venta' => $p->precio_venta,
                    // clave: relativo
                    'image_url' => $toPublic($imgPath),
                    //  clave: relativos también
                    'medias' => $p->medias->map(fn($m) => [
                        'id' => $m->id,
                        'url' => $toPublic($m->url),
                        'principal' => (bool) $m->principal,
                        'orden' => (int) $m->orden,
                        'tipo' => $m->tipo,
                    ])->values(),
                ];
            });
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
        $cotizacion->load([
            'detalles' => fn($q) => $q->where('status','activo')->orderBy('id'),
            'detalles.producto:id,sku,nombre',
            'detalles.servicio:id,nombre',
        ]);
        // Catálogo (para agregar ítems desde el Show sin pedir "ID")
        $toPublic = fn (?string $path) => $path ? '/storage/' . ltrim($path, '/') : null;
        $productos = Producto::query()
            ->where('status','activo')
            ->with(['medias' => fn($q) => $q->where('status','activo')->orderByDesc('principal')->orderBy('orden')])
            ->orderBy('nombre')
            ->get(['id','sku','nombre','precio_venta'])
            ->map(function (Producto $p) use ($toPublic) {
                $imgPath =
                    $p->medias->firstWhere('principal', 1)?->url
                    ?: $p->medias->first()?->url;
                return [
                    'id' => $p->id,
                    'sku' => $p->sku,
                    'nombre' => $p->nombre,
                    'precio_venta' => $p->precio_venta,
                    'image_url' => $toPublic($imgPath),
                    'medias' => $p->medias->map(fn($m) => [
                        'id' => $m->id,
                        'url' => $toPublic($m->url),
                        'principal' => (bool) $m->principal,
                        'orden' => (int) $m->orden,
                        'tipo' => $m->tipo,
                    ])->values(),
                ];
            });
        $servicios = Servicio::query()
            ->where('status','activo')
            ->orderBy('nombre')
            ->get(['id','nombre','precio']);
        return Inertia::render('Cotizaciones/Show', [
            'item' => $cotizacion,
            'meta' => [
                'estatuses' => ['NUEVA','EN_REVISION','DEVUELTA','ENVIADA'],
                'productos' => $productos,
                'servicios' => $servicios,
            ],
        ]);
    }

    public function update(CotizacionUpdateRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);

        $cotizacion->fill($request->only(['email_destino','telefono_destino','estatus']));
        if (!$cotizacion->estatus) $cotizacion->estatus = 'EN_REVISION';
        $cotizacion->save();
        $this->log('update', 'cotizacions', $cotizacion->id, 'Update cabecera/estatus.');
        return back(303);
    }

    public function destroy(Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);
        $cotizacion->status = 'inactivo';
        $cotizacion->save();
        $this->log('delete', 'cotizacions', $cotizacion->id, 'Baja lógica.');
        return redirect()->route('cotizaciones.index', [], 303);
    }

    public function addItem(CotizacionAddItemRequest $request, Cotizacion $cotizacion) {
        $this->ensurePanelActor();
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);
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
        $this->guardNotSent($cotizacion);
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
        // si ya está ENVIADA, no permitir “marcar otra vez”
        if (strtoupper((string) $cotizacion->estatus) === 'ENVIADA') {
            return back(303);
        }
        $cotizacion->estatus = 'ENVIADA';
        $cotizacion->save();
        $this->log('update', 'cotizacions', $cotizacion->id, 'Marcada ENVIADA (manual).');
        return back(303);
    }

    private function guardNotSent(Cotizacion $cotizacion): void {
        if (strtoupper((string) $cotizacion->estatus) === 'ENVIADA') {
            abort(422, 'La cotización ya fue marcada como ENVIADA.');
        }
    }

    // NUEVO: manda correo desde el sistema y marca ENVIADA
    public function sendEmail(Request $request, Cotizacion $cotizacion) {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);
        // Actualiza destino (si quieres permitir cambiarlo desde panel)
        $cotizacion->email_destino = $data['email'];
        // Construye todo lo necesario para el correo
        $url = route('cotizacion.public.show', $cotizacion->token);
        $cliente = $this->buildClienteInfo($cotizacion);
        $detalles = $this->buildDetallesForMail($cotizacion->id);
        try {
            Mail::to($cotizacion->email_destino)
                ->send(new CotizacionEnviadaMail(
                    cotizacion: $cotizacion,
                    detalles: $detalles,
                    publicUrl: $url,
                    cliente: $cliente
                ));
            // Solo si se envió sin explotar, marcamos ENVIADA
            $cotizacion->estatus = 'ENVIADA';
            $cotizacion->save();
            // Si quieres auditar en tu tabla logs:
            // $this->logAction('ENVIAR_CORREO', 'cotizacions', $cotizacion->id, 'Enviado a ' . $cotizacion->email_destino);
            return response()->json([
                'ok' => true,
                'to' => $cotizacion->email_destino,
                'estatus' => $cotizacion->estatus,
            ], 200);
        } catch (\Throwable $e) {
            report($e);
            LaravelLog::error('Fallo enviando cotización', [
                'cotizacion_id' => $cotizacion->id,
                'to' => $cotizacion->email_destino,
                'error' => $e->getMessage(),
            ]);
            // Si quieres auditar error en tu tabla logs:
            // $this->logAction('ERROR_ENVIO_CORREO', 'cotizacions', $cotizacion->id, $e->getMessage());
            return response()->json([
                'message' => 'No se pudo enviar el correo. Revisa logs.',
            ], 500);
        }
    }

    private function buildDetallesForMail(int $cotizacionId): array
    {
        $rows = DB::table('cotizacion_detalles as cd')
            ->leftJoin('productos as p', 'cd.producto_id', '=', 'p.id')
            ->leftJoin('marcas as m', 'p.marca_id', '=', 'm.id')
            ->leftJoin('servicios as s', 'cd.servicio_id', '=', 's.id')
            ->where('cd.cotizacion_id', $cotizacionId)
            ->where('cd.status', 'activo')
            ->orderBy('cd.id')
            ->select([
                'cd.id',
                'cd.cantidad',
                'cd.precio_unitario',
                'cd.total_linea',
                'p.sku as producto_sku',
                'p.nombre as producto_nombre',
                'm.nombre as marca_nombre',
                's.nombre as servicio_nombre',
            ])
            ->get();

        $out = [];
        foreach ($rows as $i => $r) {
            $isServicio = !empty($r->servicio_nombre);

            $desc = $isServicio
                ? $r->servicio_nombre
                : trim(
                    ($r->producto_nombre ?? 'Producto')
                    . (!empty($r->marca_nombre) ? " ({$r->marca_nombre})" : '')
                    . (!empty($r->producto_sku) ? " - {$r->producto_sku}" : '')
                );

            $out[] = [
                'n' => $i + 1,
                'tipo' => $isServicio ? 'Servicio' : 'Producto',
                'descripcion' => $desc ?: '—',
                'cantidad' => (float) ($r->cantidad ?? 1),
                'precio_unitario' => (float) ($r->precio_unitario ?? 0),
                'total_linea' => (float) ($r->total_linea ?? 0),
            ];
        }

        return $out;
    }

    private function buildClienteInfo(Cotizacion $cotizacion): array
    {
        $nombre = null;
        $empresa = null;

        if (!empty($cotizacion->persona_id)) {
            $p = DB::table('personas')
                ->where('id', $cotizacion->persona_id)
                ->select(['nombre', 'apellido_paterno', 'apellido_materno', 'empresa'])
                ->first();

            if ($p) {
                $nombre = trim(
                    ($p->nombre ?? '') . ' ' . ($p->apellido_paterno ?? '') . ' ' . ($p->apellido_materno ?? '')
                );
                $empresa = trim((string)($p->empresa ?? '')) ?: null;
            }
        }

        return [
            'nombre' => $nombre ?: '—',
            'empresa' => $empresa ?: '—',
            'email' => $cotizacion->email_destino ?: '—',
            'telefono' => $cotizacion->telefono_destino ?: '—',
        ];
    }

    private function log(string $accion, string $tabla, ?int $registroId, ?string $detalle): void {
        LogModel::create([
            'usuario_id' => auth()->id(),
            'accion' => $accion,
            'tabla' => $tabla,
            'registro_id' => $registroId,
            'detalle' => $detalle,
            'status' => 'activo',
        ]);
    }

}
