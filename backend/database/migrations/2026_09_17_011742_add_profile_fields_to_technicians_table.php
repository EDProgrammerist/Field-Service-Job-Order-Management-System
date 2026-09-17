<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('technicians', function (Blueprint $table) {
            $table->string('profile_photo_path')
                ->nullable()
                ->after('phone');

            $table->text('introduction')
                ->nullable()
                ->after('profile_photo_path');

            $table->text('qualifications')
                ->nullable()
                ->after('specialization');

            $table->text('availability_notes')
                ->nullable()
                ->after('qualifications');
        });
    }

    public function down(): void
    {
        Schema::table('technicians', function (Blueprint $table) {
            $table->dropColumn([
                'profile_photo_path',
                'introduction',
                'qualifications',
                'availability_notes',
            ]);
        });
    }
};