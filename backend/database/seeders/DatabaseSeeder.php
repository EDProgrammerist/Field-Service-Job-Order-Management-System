<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@fieldservice.test'],
            [
                'name' => 'System Administrator',
                'role' => 'admin',
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
            ]
        );
    }
}