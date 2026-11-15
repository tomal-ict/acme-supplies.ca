<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_code',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'total_amount',
        'delivery_status',
        'payment_status',
        'is_incomplete',
        'items',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'float',
            'is_incomplete' => 'boolean',
            'items' => 'array',
        ];
    }
}
