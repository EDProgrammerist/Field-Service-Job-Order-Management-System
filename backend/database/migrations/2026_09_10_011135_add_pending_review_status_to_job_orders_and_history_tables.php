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
        if (Schema::getConnection()->getDriverName() === 'mysql') {
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

            return;
        }

        Schema::table('job_orders', function (Blueprint $table) {
            $table->string('status')
                ->default('created')
                ->change();
        });

        Schema::table(
            'job_order_status_history',
            function (Blueprint $table) {
                $table->string('status')->change();
            }
        );
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

        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

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