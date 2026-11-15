<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = [
        'name',
        'email',
        'subject',
        'quantity',
        'message',
        'type',
        'status',
        'admin_notes',
        'reply_message',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
            'quantity' => 'integer',
        ];
    }
}
