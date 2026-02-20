<?php

namespace App\Http\Controllers;

use App\Models\Cotizacion;
use App\Models\Persona;
use App\Models\Producto;
use App\Models\Servicio;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // El sistema NO está abierto a clientes (por ahora)
        if ($user->rol === 'cliente') {
            abort(403);
        }

        $isAdmin = $user->rol === 'admin';

        // Base: cotizaciones activas
        $base = Cotizacion::query()->where('status', 'activo');

        // Vendedor ve solo lo suyo
        if (!$isAdmin) {
            $base->where('usuario_id', $user->id);
        }

        $cotizacionesTotal = (clone $base)->count();
        $montoTotal = (float) ((clone $base)->sum('total') ?? 0);

        $byStatus = (clone $base)
            ->select('estatus', DB::raw('COUNT(*) as total'))
            ->groupBy('estatus')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => [
                'estatus' => (string) $r->estatus,
                'total' => (int) $r->total,
            ])
            ->values();

        // Últimos 6 meses (rellena huecos)
        $monthsBack = 6;
        $from = now()->subMonths($monthsBack - 1)->startOfMonth();
        $to = now()->startOfMonth();

        $rawMonthly = (clone $base)
            ->where('created_at', '>=', $from)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(*) as total, COALESCE(SUM(total),0) as revenue")
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->keyBy('ym');

        $monthly = collect();
        foreach (CarbonPeriod::create($from, '1 month', $to) as $dt) {
            $ym = $dt->format('Y-m');
            $row = $rawMonthly->get($ym);

            $monthly->push([
                'ym' => $ym,
                'total' => (int) ($row->total ?? 0),
                'revenue' => (float) ($row->revenue ?? 0),
            ]);
        }

        $recent = (clone $base)
            ->with([
                'persona:id,nombre,apellido_paterno,apellido_materno',
                'usuario:id,name',
            ])
            ->latest('id')
            ->limit(8)
            ->get()
            ->map(fn (Cotizacion $c) => [
                'id' => (int) $c->id,
                'folio' => (string) $c->folio,
                'estatus' => (string) $c->estatus,
                'total' => (float) $c->total,
                'created_at' => $c->created_at?->toISOString(),
                'persona' => $c->persona ? [
                    'id' => (int) $c->persona->id,
                    'nombre_completo' => (string) $c->persona->nombre_completo,
                ] : null,
                'usuario' => $c->usuario ? [
                    'id' => (int) $c->usuario->id,
                    'name' => (string) $c->usuario->name,
                ] : null,
            ])
            ->values();

        $admin = null;
        if ($isAdmin) {
            // OJO: esto NO truena aunque no exista scopeActivo
            $admin = [
                'productos_activos' => $this->qActivo(Producto::class)->count(),
                'servicios_activos' => $this->qActivo(Servicio::class)->count(),
                'personas_activas' => $this->qActivo(Persona::class)->count(),
                'vendedores_activos' => $this->qActivo(User::class)->where('rol', 'vendedor')->count(),
            ];
        }

        return Inertia::render('Dashboard', [
            'role' => $isAdmin ? 'admin' : 'vendedor',
            'kpis' => [
                'cotizaciones_total' => $cotizacionesTotal,
                'monto_total' => $montoTotal,
            ],
            'byStatus' => $byStatus,
            'monthly' => $monthly,
            'recent' => $recent,
            'admin' => $admin,
        ]);
    }

    private function qActivo(string $modelClass): Builder
    {
        $q = $modelClass::query();

        // Si tienes scopeActivo, úsalo. Si no, cae a where directo sin romper prod.
        return method_exists($modelClass, 'scopeActivo')
            ? $q->activo()
            : $q->where('status', 'activo');
    }
}