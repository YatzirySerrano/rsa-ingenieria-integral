<?php

namespace App\Mail;

use App\Models\Cotizacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CotizacionEnviadaMail extends Mailable {

    use Queueable, SerializesModels;

    public function __construct(public Cotizacion $cotizacion, public string $url) {}

    public function build() {
        return $this->subject('Cotización ' . $this->cotizacion->folio)
            ->markdown('emails.cotizacion_enviada', [
                'cotizacion' => $this->cotizacion,
                'url' => $this->url,
            ]);
    }

}
