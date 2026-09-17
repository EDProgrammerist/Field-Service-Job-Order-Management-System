<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'conversations',
            function (Blueprint $table): void {
                $table->id();

                $table->foreignId('job_order_id')
                    ->unique()
                    ->constrained('job_orders')
                    ->cascadeOnDelete();

                $table->timestamps();
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};