<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('price_mode')->default('single')->after('sub_category');
            $table->decimal('single_price', 10, 2)->nullable()->after('price_mode');
            $table->json('tiered_prices')->nullable()->after('single_price');
            $table->json('gallery_images')->nullable()->after('image');
            $table->longText('description')->nullable()->after('tags');
            $table->json('specifications')->nullable()->after('description');
            $table->json('detail_images')->nullable()->after('gallery_images');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'price_mode',
                'single_price',
                'tiered_prices',
                'gallery_images',
                'description',
                'specifications',
                'detail_images',
            ]);
        });
    }
};
