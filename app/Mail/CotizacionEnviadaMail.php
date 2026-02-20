<?php

namespace App\Mail;

use App\Models\Cotizacion;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CotizacionEnviadaMail extends Mailable {

    use Queueable, SerializesModels;

    public function __construct(
        public Cotizacion $cotizacion,
        public array $detalles = [],
        public ?string $publicUrl = null,
        public array $cliente = []
    ) {
        $this->publicUrl ??= route('cotizacion.public.show', $this->cotizacion->token);
    }

    public function envelope(): Envelope {
        return new Envelope(
            subject: "Cotización {$this->cotizacion->folio}"
        );
    }

    public function content(): Content {
        return new Content(
            markdown: 'emails.cotizacion_enviada',
            with: [
                'cotizacion' => $this->cotizacion,
                'detalles' => $this->detalles,
                'url' => $this->publicUrl,
                'cliente' => $this->cliente,
            ]
        );
    }

    public function attachments(): array {
        return [];
    }

}
