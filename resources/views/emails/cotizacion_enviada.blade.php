@component('mail::message')

# 💼 Tu cotización está lista

Gracias por confiar en nosotros.

@component('mail::panel')
**Folio:** {{ $cotizacion->folio }}

**Cliente:** {{ $cliente['nombre'] ?? '—' }}

**Empresa:** {{ $cliente['empresa'] ?? '—' }}
@endcomponent

---

## 📋 Detalles de la cotización

@if(empty($detalles))
No hay conceptos activos en esta cotización.
@else

@component('mail::table')
| # | Tipo | Descripción | Cant. | P. Unit. | Importe |
|:--:|:-----|:------------|------:|---------:|--------:|
@foreach($detalles as $d)
| {{ $d['n'] }} | {{ $d['tipo'] }} | {{ $d['descripcion'] }} | {{ number_format((float)$d['cantidad'], 2, '.', ',') }} | ${{ number_format((float)$d['precio_unitario'], 2, '.', ',') }} | ${{ number_format((float)$d['total_linea'], 2, '.', ',') }} |
@endforeach
@endcomponent

@endif

---

@component('mail::panel')
**Subtotal:** ${{ number_format((float) $cotizacion->subtotal, 2, '.', ',') }} MXN

# **Total: ${{ number_format((float) $cotizacion->total, 2, '.', ',') }} MXN**
@endcomponent

@component('mail::button', ['url' => $url])
Ver cotización en nuestro sitio web
@endcomponent

Si necesitas ajustes o tienes alguna duda, responde este correo o contáctanos por WhatsApp.

---

{{ config('app.name') }}
Soluciones profesionales a tu medida

@endcomponent
