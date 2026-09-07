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
        Schema::create('job_order_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('technician_id')
                ->constrained()
                ->restrictOnDelete();
            $table->foreignId('assigned_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('unassigned_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['technician_id', 'unassigned_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_order_assignments');
    }
};