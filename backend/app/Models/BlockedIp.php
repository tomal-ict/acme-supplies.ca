<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockedIp extends Model
{
    use HasFactory;

    protected $table = 'blocked_ips';

    protected $fillable = [
        'ip_address',
        'attempt_count',
        'is_blocked',
        'blocked_at',
        'reason',
        'last_path',
        'user_agent',
        'notes',
    ];

    protected $casts = [
        'is_blocked' => 'boolean',
        'attempt_count' => 'integer',
        'blocked_at' => 'datetime',
    ];

    /**
     * Check if a given IP is blocked.
     */
    public static function isIpBlocked(string $ip): bool
    {
        return static::where('ip_address', $ip)
            ->where('is_blocked', true)
            ->exists();
    }

    /**
     * Record an unauthorized 404 hit from an IP.
     * Threshold: 2 or more attempts triggers an immediate block.
     */
    public static function record404Attempt(string $ip, ?string $path = null, ?string $userAgent = null): array
    {
        $threshold = (int) Setting::get('security_max_404_attempts', '2');
        if ($threshold < 1) $threshold = 2;

        $record = static::firstOrNew(['ip_address' => $ip]);

        $record->attempt_count = ($record->exists ? $record->attempt_count : 0) + 1;
        $record->last_path = $path ? substr($path, 0, 500) : $record->last_path;
        $record->user_agent = $userAgent ? substr($userAgent, 0, 500) : $record->user_agent;

        if ($record->attempt_count >= $threshold && !$record->is_blocked) {
            $record->is_blocked = true;
            $record->blocked_at = now();
            $record->reason = "Multiple unauthorized 404 URL scans ({$record->attempt_count} attempts, limit {$threshold})";
        }

        $record->save();

        return [
            'ip' => $record->ip_address,
            'attempts' => $record->attempt_count,
            'is_blocked' => (bool)$record->is_blocked,
            'blocked_at' => $record->blocked_at?->toIso8601String(),
        ];
    }
}
