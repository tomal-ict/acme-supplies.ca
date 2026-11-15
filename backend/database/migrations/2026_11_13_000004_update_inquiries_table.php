<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('status')->default('new')->after('type'); // 'new', 'in_progress', 'replied', 'archived'
            $table->text('admin_notes')->nullable()->after('status');
            $table->text('reply_message')->nullable()->after('admin_notes');
            $table->timestamp('replied_at')->nullable()->after('reply_message');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['status', 'admin_notes', 'reply_message', 'replied_at']);
        });
    }
};
