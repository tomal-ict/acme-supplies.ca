<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    public static function get(string $key, $default = null)
    {
        $item = static::where('key', $key)->first();
        return $item ? $item->value : $default;
    }

    public static function set(string $key, $value, string $group = 'general')
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => is_array($value) ? json_encode($value) : $value, 'group' => $group]
        );
    }

    public static function getAllGrouped(): array
    {
        $all = static::all();
        $grouped = [];
        foreach ($all as $item) {
            $grouped[$item->group][$item->key] = $item->value;
        }
        return $grouped;
    }
}
