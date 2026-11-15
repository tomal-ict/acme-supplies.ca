<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('title');
            $table->string('category');
            $table->string('sub_category')->nullable();
            $table->decimal('price_min', 8, 2);
            $table->decimal('price_max', 8, 2);
            $table->string('moq')->default('20 Pieces');
            $table->string('sold')->default('1,000+ sold');
            $table->json('tags')->nullable();
            $table->string('image');
            $table->integer('promo_discount')->default(0);
            $table->boolean('is_top_pick')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
