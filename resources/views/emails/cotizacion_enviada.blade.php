@component('mail::message')
    # Tu cotización está lista

    **Folio:** {{ $cotizacion->folio }}
    **Total:** ${{ number_format((float) $cotizacion->total, 2, '.', ',') }} MXN

    @component('mail::button', ['url' => $url])
        Ver cotización
    @endcomponent

    Si necesitas ajustes, responde este correo o contáctanos por WhatsApp.

    Gracias,
    {{ config('app.name') }}
@endcomponent
