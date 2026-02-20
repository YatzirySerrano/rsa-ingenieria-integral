<?php

namespace App\Services\Cotizaciones;

use App\Models\Cotizacion;
use App\Models\CotizacionDetalle;
use App\Models\Producto;
use App\Models\Servicio;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CotizacionCreator {

    public function __construct(private CotizacionTotals $totals) {}
    public function create(
        ?int $usuarioId,
        ?int $personaId,
        ?string $emailDestino,
        ?string $telefonoDestino,
        array $items
    ): Cotizacion {
        return DB::transaction(function () use ($usuarioId, $personaId, $emailDestino, $telefonoDestino, $items) {
            $token = (string) Str::uuid();
            $cotizacion = Cotizacion::create([
                'usuario_id' => $usuarioId,
                'persona_id' => $personaId,
                'folio' => 'TMP',
                'token' => $token,
                'estatus' => 'BORRADOR',
                'email_destino' => $emailDestino,
                'telefono_destino' => $telefonoDestino,
                'subtotal' => 0,
                'total' => 0,
                'status' => 'activo',
            ]);
            $cotizacion->folio = 'COT-' . now()->format('Ymd') . '-' . str_pad((string) $cotizacion->id, 5, '0', STR_PAD_LEFT);
            $cotizacion->save();
            // Merge items repetidos (P:ID / S:ID)
            $merged = [];
            foreach ($items as $it) {
                $tipo = strtoupper((string) ($it['tipo'] ?? ''));
                $cantidad = (float) ($it['cantidad'] ?? 0);
                if ($cantidad <= 0) continue;
                $productoId = $tipo === 'PRODUCTO' ? (int) ($it['producto_id'] ?? 0) : null;
                $servicioId = $tipo === 'SERVICIO' ? (int) ($it['servicio_id'] ?? 0) : null;
                $key = $tipo === 'PRODUCTO'
                    ? 'P:' . (string) $productoId
                    : 'S:' . (string) $servicioId;
                if (!isset($merged[$key])) {
                    $merged[$key] = [
                        'tipo' => $tipo,
                        'producto_id' => $productoId ?: null,
                        'servicio_id' => $servicioId ?: null,
                        'cantidad' => 0.0,
                    ];
                }
                $merged[$key]['cantidad'] += $cantidad;
            }
            $productoIds = collect($merged)
                ->where('tipo', 'PRODUCTO')
                ->pluck('producto_id')
                ->filter()
                ->unique()
                ->values()
                ->all();
            $servicioIds = collect($merged)
                ->where('tipo', 'SERVICIO')
                ->pluck('servicio_id')
                ->filter()
                ->unique()
                ->values()
                ->all();
            $productos = Producto::query()
                ->where('status', 'activo')
                ->whereIn('id', $productoIds)
                ->get(['id', 'precio_venta'])
                ->keyBy('id');
            $servicios = Servicio::query()
                ->where('status', 'activo')
                ->whereIn('id', $servicioIds)
                ->get(['id', 'precio'])
                ->keyBy('id');
            foreach ($merged as $m) {
                $tipo = $m['tipo'];
                $cantidad = round((float) $m['cantidad'], 2);
                if ($tipo === 'PRODUCTO') {
                    $pid = (int) $m['producto_id'];
                    $precio = (float) ($productos[$pid]->precio_venta ?? 0);
                    if ($precio <= 0) continue;
                    CotizacionDetalle::create([
                        'cotizacion_id' => $cotizacion->id,
                        'producto_id' => $pid,
                        'servicio_id' => null,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precio,
                        'total_linea' => round($cantidad * $precio, 2),
                        'status' => 'activo',
                    ]);
                } else {
                    $sid = (int) $m['servicio_id'];
                    $precio = (float) ($servicios[$sid]->precio ?? 0);
                    if ($precio <= 0) continue;
                    CotizacionDetalle::create([
                        'cotizacion_id' => $cotizacion->id,
                        'producto_id' => null,
                        'servicio_id' => $sid,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precio,
                        'total_linea' => round($cantidad * $precio, 2),
                        'status' => 'activo',
                    ]);
                }
            }
            $this->totals->recalc($cotizacion->fresh());
            // Si ya tiene items, se vuelve EN_REVISION automáticamente
            if (
                $cotizacion->fresh()
                    ->detalles()
                    ->where('status', 'activo')
                    ->exists()
                && $cotizacion->estatus === 'BORRADOR'
            ) {
                $cotizacion->estatus = 'EN_REVISION';
                $cotizacion->save();
            }
            return $cotizacion->fresh();
        });
    }

}
