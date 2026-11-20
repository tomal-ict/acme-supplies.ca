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
        'price_mode',
        'single_price',
        'tiered_prices',
        'compatible_printers',
        'price_min',
        'price_max',
        'moq',
        'sold',
        'tags',
        'description',
        'specifications',
        'image',
        'gallery_images',
        'detail_images',
        'promo_discount',
        'is_top_pick',
    ];

    protected $casts = [
        'tags' => 'array',
        'tiered_prices' => 'array',
        'gallery_images' => 'array',
        'detail_images' => 'array',
        'specifications' => 'array',
        'single_price' => 'float',
        'price_min' => 'float',
        'price_max' => 'float',
        'promo_discount' => 'integer',
        'is_top_pick' => 'boolean',
    ];
}
