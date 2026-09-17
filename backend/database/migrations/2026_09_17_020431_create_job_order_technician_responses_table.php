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
            'job_order_technician_responses',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId('job_order_id')
                    ->constrained()
                    ->cascadeOnDelete();

                $table->foreignId('schedule_revision_id')
                    ->constrained('job_order_schedule_revisions')
                    ->cascadeOnDelete();

                $table->foreignId('technician_id')
                    ->constrained()
                    ->restrictOnDelete();

                $table->foreignId('responded_by')
                    ->constrained('users')
                    ->restrictOnDelete();

                $table->string('response', 20);
                $table->text('response_notes')->nullable();
                $table->timestamp('responded_at');
                $table->timestamps();

                $table->unique(
                    'schedule_revision_id',
                    'technician_response_schedule_unique'
                );

                $table->index(
                    ['technician_id', 'response'],
                    'technician_response_lookup_index'
                );
            }
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_order_technician_responses');
    }
};