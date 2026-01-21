<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class CotizacionPanelController extends Controller
{
    /* =====================================================
     * GET /panel/cotizaciones (index + filtros)
     * ===================================================== */
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));
        $estatus = (string) $request->get('estatus', '__all__');

        $query = Cotizacion::query()
            ->with([
                'persona',
                'usuario',
                'detalles' => fn ($d) => $d->activo()->with(['producto', 'servicio']),
            ])
            ->latest('id');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('folio', 'like', "%{$q}%")
                  ->orWhere('email_destino', 'like', "%{$q}%")
                  ->orWhere('telefono_destino', 'like', "%{$q}%");
            });
        }

        if ($estatus !== '__all__' && $estatus !== '') {
            $query->where('estatus', $estatus);
        }

        $items = $query->paginate(10)->withQueryString();

        $items->getCollection()->transform(function (Cotizacion $c) {
            $calc = $this->calcTotals($c);
            $reply = $this->readReplyFromToken($c->token);

            $c->setAttribute('total_calculado', $calc['total_calculado']);
            $c->setAttribute('diferencia_total', $calc['diferencia_total']);
            $c->setAttribute('respuesta_resumen', $reply['respuesta_resumen'] ?? null);
            $c->setAttribute('descuento_monto', $reply['descuento_monto'] ?? 0);
            $c->setAttribute('total_final', $reply['total_final'] ?? null);

            return $c;
        });

        $meta = [
            'estatuses' => Cotizacion::query()
                ->select('estatus')
                ->whereNotNull('estatus')
                ->distinct()
                ->orderBy('estatus')
                ->pluck('estatus')
                ->values()
                ->all(),
        ];

        // IMPORTANTE: esto define la carpeta/archivo Vue:
        // resources/js/Pages/Cotizaciones/Index.vue
        return Inertia::render('cotizaciones/Index', [
            'items' => $items,
            'filters' => [
                'q' => $q,
                'estatus' => $estatus,
            ],
            'meta' => $meta,
        ]);
    }

    /* =====================================================
     * GET /panel/cotizaciones/{id} (detalle)
     * ===================================================== */
    public function show(Cotizacion $cotizacion): Response
    {
        $cotizacion->load([
            'persona',
            'usuario',
            'detalles' => fn ($d) => $d->activo()->with(['producto', 'servicio']),
        ]);

        $calc = $this->calcTotals($cotizacion);
        $reply = $this->readReplyFromToken($cotizacion->token);

        $cotizacion->setAttribute('total_calculado', $calc['total_calculado']);
        $cotizacion->setAttribute('diferencia_total', $calc['diferencia_total']);
        $cotizacion->setAttribute('respuesta_resumen', $reply['respuesta_resumen'] ?? null);
        $cotizacion->setAttribute('descuento_monto', $reply['descuento_monto'] ?? 0);
        $cotizacion->setAttribute('total_final', $reply['total_final'] ?? null);
        $cotizacion->setAttribute('reply_meta', $reply['meta'] ?? null);

        // resources/js/Pages/Cotizaciones/Show.vue
        return Inertia::render('cotizaciones/Show', [
            'cotizacion' => $cotizacion,
        ]);
    }

    /* =====================================================
     * PUT /panel/cotizaciones/{id}/reply (guardar respuesta + DEVUELTA)
     * ===================================================== */
    public function reply(Request $request, Cotizacion $cotizacion)
    {
        $data = $request->validate([
            'respuesta_resumen' => ['required', 'string', 'min:5', 'max:5000'],
            'descuento_monto' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'total_final' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
        ]);

        $cotizacion->load(['detalles' => fn ($d) => $d->activo()]);

        $calc = $this->calcTotals($cotizacion);
        $base = (float) $calc['total_calculado'];

        $descuento = (float) ($data['descuento_monto'] ?? 0);
        $totalFinal = array_key_exists('total_final', $data) && $data['total_final'] !== null
            ? (float) $data['total_final']
            : max(0, $base - $descuento);

        $reply = [
            'respuesta_resumen' => trim($data['respuesta_resumen']),
            'descuento_monto' => round($descuento, 2),
            'total_final' => round($totalFinal, 2),
            'meta' => [
                'responded_at' => now()->toIso8601String(),
                'responded_by' => $request->user()?->id,
                'calc_total' => round($base, 2),
                'client_total' => round((float) $cotizacion->total, 2),
                'diff_total' => round((float) $calc['diferencia_total'], 2),
            ],
        ];

        $cotizacion->token = $this->writeReplyIntoToken($cotizacion->token, $reply);
        $cotizacion->estatus = 'DEVUELTA';
        $cotizacion->save();

        return back()->with('success', 'Respuesta guardada y marcada como DEVUELTA.');
    }

    /* =====================================================
     * POST /panel/cotizaciones/{id}/send-email
     * ===================================================== */
    public function sendEmail(Request $request, Cotizacion $cotizacion)
    {
        $email = trim((string) ($cotizacion->email_destino ?? ''));
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return back()->withErrors(['email_destino' => 'Correo inválido o vacío.']);
        }

        $reply = $this->readReplyFromToken($cotizacion->token);
        $resumen = trim((string) ($reply['respuesta_resumen'] ?? ''));
        if ($resumen === '') {
            return back()->withErrors(['respuesta_resumen' => 'Primero guarda la respuesta (Responder).']);
        }

        $totalFinal = (float) ($reply['total_final'] ?? $cotizacion->total);
        $descuento = (float) ($reply['descuento_monto'] ?? 0);

        $subject = "Respuesta a tu cotización {$cotizacion->folio}";
        $html = $this->buildReplyEmailHtml(
            folio: (string) $cotizacion->folio,
            resumen: $resumen,
            totalFinal: $totalFinal,
            descuento: $descuento
        );

        try {
            Mail::send([], [], function ($message) use ($email, $subject, $html) {
                $message->to($email)
                    ->subject($subject)
                    ->setBody($html, 'text/html');
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['email_send' => 'No se pudo enviar el correo. Revisa configuración MAIL.']);
        }

        return back()->with('success', 'Correo enviado al cliente.');
    }

    /* =====================================================
     * POST /panel/cotizaciones/{id}/send-whatsapp
     * SIN API: redirect a wa.me con texto precargado
     * ===================================================== */
    public function sendWhatsapp(Request $request, Cotizacion $cotizacion)
    {
        $phoneRaw = (string) ($cotizacion->telefono_destino ?? '');
        $digits = preg_replace('/\D+/', '', $phoneRaw) ?? '';

        if (strlen($digits) < 10) {
            return back()->withErrors(['telefono_destino' => 'Teléfono inválido o vacío.']);
        }

        $reply = $this->readReplyFromToken($cotizacion->token);
        $resumen = trim((string) ($reply['respuesta_resumen'] ?? ''));
        if ($resumen === '') {
            return back()->withErrors(['respuesta_resumen' => 'Primero guarda la respuesta (Responder).']);
        }

        $totalFinal = (float) ($reply['total_final'] ?? $cotizacion->total);

        // Si vienen 10 dígitos, asumimos MX y anteponemos 52
        if (strlen($digits) === 10) $digits = '52' . $digits;

        $msg = $this->buildWhatsappMessage(
            folio: (string) $cotizacion->folio,
            resumen: $resumen,
            totalFinal: $totalFinal
        );

        $url = 'https://wa.me/' . $digits . '?text=' . urlencode($msg);

        return redirect()->away($url);
    }

    /* =========================
     * Helpers
     * ========================= */

    private function calcTotals(Cotizacion $c): array
    {
        $sum = 0.0;
        foreach ($c->detalles ?? [] as $d) {
            $sum += (float) $d->total_linea;
        }

        $totalCalculado = round($sum, 2);
        $totalCliente = round((float) $c->total, 2);

        return [
            'total_calculado' => $totalCalculado,
            'diferencia_total' => round($totalCliente - $totalCalculado, 2),
        ];
    }

    private function readReplyFromToken(?string $token): array
    {
        $token = trim((string) ($token ?? ''));
        if ($token === '') return [];

        $decoded = json_decode($token, true);
        if (!is_array($decoded)) return [];

        $reply = $decoded['panel_reply'] ?? null;
        return is_array($reply) ? $reply : [];
    }

    private function writeReplyIntoToken(?string $token, array $reply): string
    {
        $token = trim((string) ($token ?? ''));

        $decoded = json_decode($token, true);
        if (!is_array($decoded)) {
            $decoded = $token !== '' ? ['legacy_token' => $token] : [];
        }

        $decoded['panel_reply'] = $reply;

        return json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function buildWhatsappMessage(string $folio, string $resumen, float $totalFinal): string
    {
        $total = number_format($totalFinal, 2);
        return "Cotización {$folio}\n\n{$resumen}\n\nTotal final: $ {$total}";
    }

    private function buildReplyEmailHtml(string $folio, string $resumen, float $totalFinal, float $descuento): string
    {
        $total = number_format($totalFinal, 2);
        $desc = number_format($descuento, 2);

        $descuentoHtml = $descuento > 0
            ? "<p style=\"margin:6px 0 0; color:#64748b; font-size:13px;\">Descuento aplicado: $ {$desc}</p>"
            : "";

        $resumenSafe = nl2br(e($resumen));

        return "
<!doctype html>
<html lang=\"es\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>Respuesta de cotización</title>
</head>
<body style=\"margin:0; padding:0; background:#f6f7fb; font-family: Arial, Helvetica, sans-serif;\">
  <div style=\"max-width:640px; margin:0 auto; padding:24px;\">
    <div style=\"background:#ffffff; border:1px solid #e6e8ef; border-radius:16px; padding:20px;\">
      <h2 style=\"margin:0 0 10px; font-size:18px; color:#0f172a;\">Cotización {$folio}</h2>
      <div style=\"background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin:12px 0;\">
        <p style=\"margin:0; color:#0f172a; font-size:14px; line-height:1.55;\">{$resumenSafe}</p>
      </div>
      <p style=\"margin:0; color:#0f172a; font-weight:700; font-size:14px;\">Total final: $ {$total}</p>
      {$descuentoHtml}
      <p style=\"margin:16px 0 0; color:#64748b; font-size:12px;\">Folio: {$folio}</p>
    </div>
  </div>
</body>
</html>";
    }
}
