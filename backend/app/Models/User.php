<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'permissions',
        'is_active',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'permissions' => 'array',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'super_admin') {
            return true;
        }

        $perms = $this->permissions ?? [];
        return in_array($permission, $perms, true);
    }

    public function generateAuthToken(int $ttlHours = 24): string
    {
        $payload = [
            'uid' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'exp' => now()->addHours($ttlHours)->timestamp,
            'nonce' => Str::random(16),
        ];

        return Crypt::encryptString(json_encode($payload));
    }

    public static function validateAuthToken(?string $token): ?self
    {
        if (!$token) {
            return null;
        }

        try {
            $decrypted = Crypt::decryptString($token);
            $payload = json_decode($decrypted, true);

            if (!is_array($payload) || !isset($payload['uid'], $payload['exp'])) {
                return null;
            }

            if ($payload['exp'] < now()->timestamp) {
                return null; // Expired
            }

            $user = self::find($payload['uid']);
            if (!$user || !$user->is_active) {
                return null;
            }

            return $user;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
