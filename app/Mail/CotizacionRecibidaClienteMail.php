<?php

namespace App\Mail;

use App\Models\Cotizacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CotizacionRecibidaClienteMail extends Mailable {

    use Queueable, SerializesModels;

    public function __construct(
        public Cotizacion $cotizacion,
        public ?string $publicUrl = null,
    ) {
        $this->publicUrl ??= route('cotizacion.public.show', $this->cotizacion->token);
    }

    public function envelope(): Envelope {
        return new Envelope(
            subject: "Recibimos tu cotización {$this->cotizacion->folio}"
        );
    }

    public function content(): Content {
        return new Content(
            markdown: 'emails.cotizacion_recibida_cliente',
            with: [
                'cotizacion' => $this->cotizacion,
                'url' => $this->publicUrl,
            ]
        );
    }

    public function attachments(): array {
        return [];
    }

}