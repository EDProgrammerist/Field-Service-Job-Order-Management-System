<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE `users`
            MODIFY `role`
            ENUM('admin', 'dispatcher', 'technician', 'customer')
            NOT NULL DEFAULT 'technician'
        ");

        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique('customers_user_id_unique');
            $table->dropColumn('user_id');
        });

        DB::table('users')
            ->where('role', 'customer')
            ->update(['role' => 'technician']);

        DB::statement("
            ALTER TABLE `users`
            MODIFY `role`
            ENUM('admin', 'dispatcher', 'technician')
            NOT NULL DEFAULT 'technician'
        ");
    }
};