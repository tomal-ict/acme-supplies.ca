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
        'delivery_area',
        'delivery_charge',
        'subtotal',
        'total_amount',
        'delivery_status',
        'payment_status',
        'payment_method',
        'is_incomplete',
        'items',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'delivery_charge' => 'float',
            'subtotal' => 'float',
            'total_amount' => 'float',
            'is_incomplete' => 'boolean',
            'items' => 'array',
        ];
    }
}
