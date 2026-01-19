<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'status',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function scopeActivo(Builder $query): Builder
    {
        return $query->where('status', 'activo');
    }

    public function persona(): HasOne
    {
        return $this->hasOne(Persona::class, 'usuario_id');
    }

    public function isAdmin(): bool { return $this->rol === 'admin'; }
    public function isVendedor(): bool { return $this->rol === 'vendedor'; }
    public function isCliente(): bool { return $this->rol === 'cliente'; }
    
}
