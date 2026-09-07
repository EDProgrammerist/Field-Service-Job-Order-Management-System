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
        Schema::create('job_order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->enum('status', [
                'created',
                'assigned',
                'in_progress',
                'completed',
                'closed',
                'cancelled',
            ]);
            $table->foreignId('changed_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['job_order_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_order_status_history');
    }
};