@component('mail::message')
# Hemos recibido tu cotización

Hola,

Recibimos correctamente tu solicitud de cotización con folio **{{ $cotizacion->folio }}**.

En breve revisaremos la información y te daremos seguimiento.

@component('mail::button', ['url' => $url])
Ver cotización
@endcomponent

**Correo:** {{ $cotizacion->email_destino ?: 'No capturado' }}  
**Teléfono:** {{ $cotizacion->telefono_destino ?: 'No capturado' }}

Gracias,  
**RSA Ingeniería Integral**
@endcomponent