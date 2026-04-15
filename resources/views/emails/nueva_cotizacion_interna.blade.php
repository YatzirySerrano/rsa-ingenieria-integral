@component('mail::message')
# Nueva cotización recibida

Se generó una nueva cotización con folio **{{ $cotizacion->folio }}**.

**Estatus:** {{ $cotizacion->estatus }}  
**Correo cliente:** {{ $cotizacion->email_destino ?: 'No capturado' }}  
**Teléfono cliente:** {{ $cotizacion->telefono_destino ?: 'No capturado' }}  
**Total:** ${{ number_format((float) $cotizacion->total, 2) }}

@if(count($detalles))
## Detalles
@foreach($detalles as $item)
- {{ $item['descripcion'] }} — Cantidad: {{ $item['cantidad'] }} — Total: ${{ number_format((float) $item['total_linea'], 2) }}
@endforeach
@endif

@component('mail::button', ['url' => $url])
Abrir cotización
@endcomponent

**RSA Ingeniería Integral**
@endcomponent