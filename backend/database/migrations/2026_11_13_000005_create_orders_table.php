<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->text('shipping_address')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->string('delivery_status')->default('pending'); // pending, confirmed, picked, on_delivery, delivered, cancelled
            $table->string('payment_status')->default('unpaid'); // unpaid, paid
            $table->boolean('is_incomplete')->default(false); // false = active order, true = incomplete order / abandoned cart
            $table->json('items')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
