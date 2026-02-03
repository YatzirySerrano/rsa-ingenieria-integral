<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $plainPassword;

    public function __construct(User $user, string $plainPassword)
    {
        $this->user = $user;
        $this->plainPassword = $plainPassword;
    }

    public function build()
    {
        // Nota: esto lo dejé simple: vista blade + subject claro.
        // Si después quieres colas, este mail ya está listo para queue.
        return $this->subject('Acceso a RSA Ingeniería Integral')
            ->view('emails.users.credentials')
            ->with([
                'user' => $this->user,
                'plainPassword' => $this->plainPassword,
                'loginUrl' => url('/login'),
                'appName' => config('app.name', 'RSA Ingeniería Integral'),
            ]);
    }
}