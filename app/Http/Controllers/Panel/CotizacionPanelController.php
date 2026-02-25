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
use App\Models\User;
use App\Services\Cotizaciones\CotizacionCreator;
use App\Services\Cotizaciones\CotizacionTotals;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log as LaravelLog;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CotizacionPanelController extends Controller
{
    public function __construct(private CotizacionTotals $totals) {}

    public function index(CotizacionIndexRequest $request)
    {
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

        return Inertia::render('cotizaciones/Index', [
            'items' => $items,
            'filters' => [
                'q' => $q ?: null,
                'estatus' => $estatus ?: '__all__',
            ],
            'meta' => [
                'estatuses' => ['BORRADOR', 'EN_REVISION', 'DEVUELTA', 'ENVIADA'],
            ],
        ]);
    }

    public function create()
    {
        $toPublic = fn (?string $path) => $path ? '/storage/' . ltrim($path, '/') : null;

        $productos = Producto::query()
            ->where('status', 'activo')
            ->with(['medias' => fn ($q) => $q->where('status', 'activo')->orderByDesc('principal')->orderBy('orden')])
            ->orderBy('nombre')
            ->get(['id', 'sku', 'nombre', 'precio_venta'])
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
                    'medias' => $p->medias->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $toPublic($m->url),
                        'principal' => (bool) $m->principal,
                        'orden' => (int) $m->orden,
                        'tipo' => $m->tipo,
                    ])->values(),
                ];
            });

        $servicios = Servicio::query()
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'precio']);

        return Inertia::render('cotizaciones/Create', [
            'meta' => [
                'productos' => $productos,
                'servicios' => $servicios,
                'estatuses' => ['BORRADOR', 'EN_REVISION', 'DEVUELTA', 'ENVIADA'],
            ],
        ]);
    }

    public function store(CotizacionPanelStoreRequest $request, CotizacionCreator $creator)
    {
        $actor = $request->user(); // admin/vendedor/cliente

        $usuarioId = null;
        $personaId = null;
        $emailDestino = null;
        $telefonoDestino = null;

        if ($actor->rol === 'cliente') {
            $actor->load('persona');

            if (!$actor->persona) {
                abort(422, 'Tu cuenta no tiene datos de persona vinculados.');
            }

            $usuarioId = $actor->id;
            $personaId = $actor->persona->id;
            $emailDestino = $actor->email;
            $telefonoDestino = $actor->persona->telefono;
        } else {
            // staff: puede ser usuario existente (de cualquier rol) O lead no registrado
            $clienteUserIdRaw = $request->input('cliente_usuario_id');

            if ($clienteUserIdRaw) {
                $clienteUserId = (int) $clienteUserIdRaw;

                $u = User::query()
                    ->where('id', $clienteUserId)
                    ->where('status', 'activo')
                    ->with('persona:id,usuario_id,telefono')
                    ->firstOrFail();

                $usuarioId = $u->id;
                $personaId = $u->persona?->id;
                $emailDestino = $u->email;
                $telefonoDestino = $u->persona?->telefono ?: null;

                // Si por alguna razón ese usuario no tiene correo y tampoco teléfono, no hay a dónde mandar nada
                if (trim((string) $emailDestino) === '' && trim((string) $telefonoDestino) === '') {
                    abort(422, 'Ese usuario no tiene correo ni teléfono. Usa modo "No registrado" y captura contacto.');
                }
            } else {
                // lead NO REGISTRADO
                $emailDestino = trim((string) $request->input('email_destino', ''));
                $telefonoDestino = trim((string) $request->input('telefono_destino', ''));

                if ($emailDestino === '' && $telefonoDestino === '') {
                    abort(422, 'Captura al menos correo o teléfono del cliente no registrado.');
                }

                $usuarioId = null;
                $personaId = null;
            }
        }

        $items = (array) $request->input('items', []);
        if (!count($items)) {
            abort(422, 'Agrega al menos 1 item.');
        }

        $cotizacion = $creator->create(
            $usuarioId,
            $personaId,
            $emailDestino,
            $telefonoDestino,
            $items
        );

        $this->log('create', 'cotizacions', $cotizacion->id, 'Creada desde panel.');
        return redirect()->route('cotizaciones.show', ['cotizacion' => $cotizacion->id], 303);
    }

    public function show(Cotizacion $cotizacion)
    {
        $cotizacion->load([
            'detalles' => fn ($q) => $q->where('status', 'activo')->orderBy('id'),
            'detalles.producto:id,sku,nombre',
            'detalles.servicio:id,nombre',
        ]);

        $toPublic = fn (?string $path) => $path ? '/storage/' . ltrim($path, '/') : null;

        $productos = Producto::query()
            ->where('status', 'activo')
            ->with(['medias' => fn ($q) => $q->where('status', 'activo')->orderByDesc('principal')->orderBy('orden')])
            ->orderBy('nombre')
            ->get(['id', 'sku', 'nombre', 'precio_venta'])
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
                    'medias' => $p->medias->map(fn ($m) => [
                        'id' => $m->id,
                        'url' => $toPublic($m->url),
                        'principal' => (bool) $m->principal,
                        'orden' => (int) $m->orden,
                        'tipo' => $m->tipo,
                    ])->values(),
                ];
            });

        $servicios = Servicio::query()
            ->where('status', 'activo')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'precio']);

        return Inertia::render('cotizaciones/Show', [
            'item' => $cotizacion,
            'meta' => [
                'estatuses' => ['BORRADOR', 'EN_REVISION', 'DEVUELTA', 'ENVIADA'],
                'productos' => $productos,
                'servicios' => $servicios,
            ],
        ]);
    }

    public function update(CotizacionUpdateRequest $request, Cotizacion $cotizacion)
    {
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);

        $cotizacion->fill($request->only(['email_destino', 'telefono_destino', 'estatus']));
        if (!$cotizacion->estatus) {
            $cotizacion->estatus = 'EN_REVISION';
        }
        $cotizacion->save();

        $this->log('update', 'cotizacions', $cotizacion->id, 'Update cabecera/estatus.');
        return back(303);
    }

    public function destroy(Cotizacion $cotizacion)
    {
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);

        $cotizacion->status = 'inactivo';
        $cotizacion->save();

        $this->log('delete', 'cotizacions', $cotizacion->id, 'Baja lógica.');
        return redirect()->route('cotizaciones.index', [], 303);
    }

    public function addItem(CotizacionAddItemRequest $request, Cotizacion $cotizacion)
    {
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);

        $tipo = (string) $request->input('tipo');
        $cantidad = (float) $request->input('cantidad');

        $productoId = $tipo === 'PRODUCTO' ? (int) $request->input('producto_id') : null;
        $servicioId = $tipo === 'SERVICIO' ? (int) $request->input('servicio_id') : null;

        $precio = 0.0;

        if ($tipo === 'PRODUCTO') {
            $p = Producto::where('id', $productoId)->where('status', 'activo')->firstOrFail();
            $precio = (float) $p->precio_venta;
        } else {
            $s = Servicio::where('id', $servicioId)->where('status', 'activo')->firstOrFail();
            $precio = (float) $s->precio;
        }

        $detalle = CotizacionDetalle::query()
            ->where('cotizacion_id', $cotizacion->id)
            ->where('status', 'activo')
            ->when($productoId, fn ($q) => $q->where('producto_id', $productoId)->whereNull('servicio_id'))
            ->when($servicioId, fn ($q) => $q->where('servicio_id', $servicioId)->whereNull('producto_id'))
            ->first();

        $detalleId = null;

        if ($detalle) {
            $detalle->cantidad = (float) $detalle->cantidad + $cantidad;
            $detalle->precio_unitario = $precio;
            $detalle->total_linea = round(((float) $detalle->cantidad) * $precio, 2);
            $detalle->save();
            $detalleId = $detalle->id;
        } else {
            $new = CotizacionDetalle::create([
                'cotizacion_id' => $cotizacion->id,
                'producto_id' => $productoId,
                'servicio_id' => $servicioId,
                'cantidad' => $cantidad,
                'precio_unitario' => $precio,
                'total_linea' => round($cantidad * $precio, 2),
                'status' => 'activo',
            ]);
            $detalleId = $new->id;
        }

        if ($cotizacion->estatus === 'BORRADOR') {
            $cotizacion->estatus = 'EN_REVISION';
            $cotizacion->save();
        }

        $this->totals->recalc($cotizacion);
        $this->log('create', 'cotizacion_detalles', $detalleId, 'Add item.');
        return back(303);
    }

    public function reply(CotizacionReplyRequest $request, Cotizacion $cotizacion)
    {
        abort_unless($cotizacion->status === 'activo', 404);
        $this->guardNotSent($cotizacion);

        $cotizacion->fill($request->only(['email_destino', 'telefono_destino']));
        $cotizacion->estatus = 'DEVUELTA';
        $cotizacion->save();

        $this->log('update', 'cotizacions', $cotizacion->id, 'Marcada DEVUELTA.');
        return back(303);
    }

    public function markSent(CotizacionMarkSentRequest $request, Cotizacion $cotizacion)
    {
        abort_unless($cotizacion->status === 'activo', 404);

        if (strtoupper((string) $cotizacion->estatus) === 'ENVIADA') {
            return back(303);
        }

        $cotizacion->estatus = 'ENVIADA';
        $cotizacion->save();

        $this->log('update', 'cotizacions', $cotizacion->id, 'Marcada ENVIADA (manual).');
        return back(303);
    }

    private function guardNotSent(Cotizacion $cotizacion): void
    {
        if (strtoupper((string) $cotizacion->estatus) === 'ENVIADA') {
            abort(422, 'La cotización ya fue marcada como ENVIADA.');
        }
    }

    public function sendEmail(CotizacionSendEmailRequest $request, Cotizacion $cotizacion)
    {
        $this->guardNotSent($cotizacion);

        $email = (string) $request->validated('email');
        $cotizacion->email_destino = $email;

        $url = route('cotizacion.public.show', $cotizacion->token);
        $cliente = $this->buildClienteInfo($cotizacion);
        $detalles = $this->buildDetallesForMail($cotizacion->id);

        try {
            Mail::to($cotizacion->email_destino)->send(
                new CotizacionEnviadaMail(
                    cotizacion: $cotizacion,
                    detalles: $detalles,
                    publicUrl: $url,
                    cliente: $cliente
                )
            );

            $cotizacion->estatus = 'ENVIADA';
            $cotizacion->save();

            $this->log('update', 'cotizacions', $cotizacion->id, 'Correo enviado y marcada ENVIADA.');

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
                $empresa = trim((string) ($p->empresa ?? '')) ?: null;
            }
        }

        return [
            'nombre' => $nombre ?: '—',
            'empresa' => $empresa ?: '—',
            'email' => $cotizacion->email_destino ?: '—',
            'telefono' => $cotizacion->telefono_destino ?: '—',
        ];
    }

    private function log(string $accion, string $tabla, ?int $registroId, ?string $detalle): void
    {
        LogModel::create([
            'usuario_id' => auth()->id(),
            'accion' => $accion,
            'tabla' => $tabla,
            'registro_id' => $registroId,
            'detalle' => $detalle,
            'status' => 'activo',
        ]);
    }

    public function clientesLookup(Request $request)
{
    $q = trim((string) $request->get('q', ''));

    // Si viene algo, mínimo 2 chars. Si viene vacío, devolvemos top 50.
    if ($q !== '' && mb_strlen($q) < 2) {
        return response()->json(['data' => []]);
    }

    $roles = ['cliente', 'admin', 'vendedor'];

    $users = User::query()
        // status robusto: acepta activo/ACTIVO/Activo...
        ->whereRaw('LOWER(status) = ?', ['activo'])
        // SOLO estos roles
        ->whereIn('rol', $roles)
        ->with('persona:id,usuario_id,telefono')
        ->when($q !== '', function ($qq) use ($q) {
            $qq->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('rol', 'like', "%{$q}%");
            });
        })
        ->orderBy('name')
        ->limit(50)
        ->get(['id', 'name', 'email', 'rol']);

    return response()->json([
        'data' => $users->map(fn ($u) => [
            'id' => $u->id,
            'label' => "{$u->name} — {$u->email}",
            'email' => $u->email,
            'telefono' => $u->persona?->telefono,
            'persona_id' => $u->persona?->id,
            'rol' => (string) ($u->rol ?? ''),
            'has_persona' => (bool) $u->persona,
        ])->values(),
    ]);
}
    
}