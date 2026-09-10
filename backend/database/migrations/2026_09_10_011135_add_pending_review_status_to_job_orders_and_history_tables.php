<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE `job_orders`
            MODIFY `status`
            ENUM(
                'pending_review',
                'created',
                'assigned',
                'in_progress',
                'completed',
                'closed',
                'cancelled'
            )
            NOT NULL DEFAULT 'created'
        ");

        DB::statement("
            ALTER TABLE `job_order_status_history`
            MODIFY `status`
            ENUM(
                'pending_review',
                'created',
                'assigned',
                'in_progress',
                'completed',
                'closed',
                'cancelled'
            )
            NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('job_order_status_history')
            ->where('status', 'pending_review')
            ->update(['status' => 'created']);

        DB::table('job_orders')
            ->where('status', 'pending_review')
            ->update(['status' => 'created']);

        DB::statement("
            ALTER TABLE `job_orders`
            MODIFY `status`
            ENUM(
                'created',
                'assigned',
                'in_progress',
                'completed',
                'closed',
                'cancelled'
            )
            NOT NULL DEFAULT 'created'
        ");

        DB::statement("
            ALTER TABLE `job_order_status_history`
            MODIFY `status`
            ENUM(
                'created',
                'assigned',
                'in_progress',
                'completed',
                'closed',
                'cancelled'
            )
            NOT NULL
        ");
    }
};