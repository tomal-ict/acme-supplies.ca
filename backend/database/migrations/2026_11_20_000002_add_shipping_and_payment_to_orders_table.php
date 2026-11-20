<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_area')->nullable()->after('shipping_address');
            $table->decimal('delivery_charge', 10, 2)->default(0.00)->after('delivery_area');
            $table->decimal('subtotal', 12, 2)->default(0.00)->after('delivery_charge');
            $table->string('payment_method')->default('Cash on Delivery')->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_area',
                'delivery_charge',
                'subtotal',
                'payment_method',
            ]);
        });
    }
};
