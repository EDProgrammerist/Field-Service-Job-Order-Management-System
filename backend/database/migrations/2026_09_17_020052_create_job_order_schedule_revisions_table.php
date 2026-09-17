<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create(
            'job_order_schedule_revisions',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId('job_order_id')
                    ->constrained()
                    ->cascadeOnDelete();

                $table->unsignedInteger('version');

                $table->timestamp('scheduled_at');
                $table->timestamp('scheduled_end_at');

                $table->foreignId('scheduled_by')
                    ->constrained('users')
                    ->restrictOnDelete();

                $table->text('remarks')->nullable();
                $table->timestamps();

                $table->unique(
                    ['job_order_id', 'version'],
                    'job_order_schedule_revision_unique'
                );

                $table->index(
                    ['job_order_id', 'scheduled_at'],
                    'job_order_schedule_start_index'
                );
            }
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_order_schedule_revisions');
    }
};