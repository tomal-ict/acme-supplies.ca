<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'compatible_printers')) {
            Schema::table('products', function (Blueprint $table) {
                $table->text('compatible_printers')->nullable()->after('sub_category');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'compatible_printers')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('compatible_printers');
            });
        }
    }
};
