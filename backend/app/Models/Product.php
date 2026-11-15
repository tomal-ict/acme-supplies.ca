<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'title',
        'category',
        'sub_category',
        'compatible_printers',
        'price_min',
        'price_max',
        'moq',
        'sold',
        'tags',
        'image',
        'promo_discount',
        'is_top_pick',
    ];

    protected $casts = [
        'tags' => 'array',
        'price_min' => 'float',
        'price_max' => 'float',
        'promo_discount' => 'integer',
        'is_top_pick' => 'boolean',
    ];
}
