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
        $this->changeStatusColumnsToStrings();

        Schema::table('job_orders', function (Blueprint $table) {
            $table->foreignId('selected_technician_id')
                ->nullable()
                ->after('customer_id')
                ->constrained('technicians')
                ->restrictOnDelete();

            $table->timestamp('scheduled_end_at')
                ->nullable()
                ->after('scheduled_at');

            $table->unsignedInteger('schedule_version')
                ->default(0)
                ->after('scheduled_end_at');

            $table->foreignId('scheduled_by')
                ->nullable()
                ->after('schedule_version')
                ->constrained('users')
                ->restrictOnDelete();

            $table->index(
                [
                    'selected_technician_id',
                    'status',
                    'scheduled_at',
                    'scheduled_end_at',
                ],
                'job_orders_technician_status_schedule_index'
            );
        });

        Schema::table('job_order_status_history', function (Blueprint $table) {
            $table->string('previous_status', 50)
                ->nullable()
                ->after('job_order_id');

            $table->string('action', 50)
                ->nullable()
                ->after('status');

            $table->json('metadata')
                ->nullable()
                ->after('remarks');
        });

        $this->backfillSelectedTechnicians();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->mapNewStatusesToLegacyStatuses();

        Schema::table('job_order_status_history', function (Blueprint $table) {
            $table->dropColumn([
                'previous_status',
                'action',
                'metadata',
            ]);
        });

        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropIndex(
                'job_orders_technician_status_schedule_index'
            );

            $table->dropConstrainedForeignId('scheduled_by');
            $table->dropConstrainedForeignId(
                'selected_technician_id'
            );

            $table->dropColumn([
                'scheduled_end_at',
                'schedule_version',
            ]);
        });

        $this->restoreMySqlStatusEnums();
    }

    /**
     * Convert restrictive MySQL enums to extensible string columns.
     *
     * SQLite already uses strings because of the earlier
     * test-compatibility migration.
     */
    private function changeStatusColumnsToStrings(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("
            ALTER TABLE `job_orders`
            MODIFY `status`
            VARCHAR(50)
            NOT NULL DEFAULT 'created'
        ");

        DB::statement("
            ALTER TABLE `job_order_status_history`
            MODIFY `status`
            VARCHAR(50)
            NOT NULL
        ");
    }

    /**
     * Copy existing active assignment technicians into the new selection field.
     */
    private function backfillSelectedTechnicians(): void
    {
        DB::table('job_orders')
            ->select('id')
            ->chunkById(100, function ($jobOrders): void {
                foreach ($jobOrders as $jobOrder) {
                    $technicianId = DB::table(
                        'job_order_assignments'
                    )
                        ->where('job_order_id', $jobOrder->id)
                        ->whereNull('unassigned_at')
                        ->orderByDesc('id')
                        ->value('technician_id');

                    if ($technicianId === null) {
                        continue;
                    }

                    DB::table('job_orders')
                        ->where('id', $jobOrder->id)
                        ->update([
                            'selected_technician_id' => $technicianId,
                        ]);
                }
            });
    }

    /**
     * Convert new statuses before restoring the old MySQL enum.
     */
    private function mapNewStatusesToLegacyStatuses(): void
    {
        $statusMap = [
            'pending_schedule' => 'created',
            'pending_technician_response' => 'assigned',
            'accepted' => 'assigned',
            'technician_rejected' => 'created',
        ];

        foreach (['job_orders', 'job_order_status_history'] as $table) {
            foreach ($statusMap as $newStatus => $legacyStatus) {
                DB::table($table)
                    ->where('status', $newStatus)
                    ->update([
                        'status' => $legacyStatus,
                    ]);
            }
        }
    }

    /**
     * Restore the original MySQL enum if this migration is rolled back.
     */
    private function restoreMySqlStatusEnums(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

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
};