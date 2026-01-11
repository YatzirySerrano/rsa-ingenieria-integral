<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable {
    
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Campos asignables
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'status',
    ];

    /**
     * Campos ocultos
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Casts
     */
    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Scope: solo usuarios activos
     */
    public function scopeActivo(Builder $query): Builder {
        return $query->where('status', 'activo');
    }

    /**
     * Helpers de rol (opcional pero recomendado)
     */
    public function isAdmin(): bool {
        return $this->rol === 'admin';
    }

    public function isVendedor(): bool {
        return $this->rol === 'vendedor';
    }

    public function isCliente(): bool {
        return $this->rol === 'cliente';
    }

}
