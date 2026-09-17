<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('Password123!');

        User::updateOrCreate(
            [
                'email' => 'admin@fieldservice.test',
            ],
            [
                'name' => 'System Administrator',
                'role' => 'admin',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'dispatcher@fieldservice.test',
            ],
            [
                'name' => 'Test Dispatcher',
                'role' => 'dispatcher',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $technicianUser = User::updateOrCreate(
            [
                'email' =>
                    'technician.test@fieldservice.test',
            ],
            [
                'name' => 'Test Technician',
                'role' => 'technician',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $technicianUser
            ->technician()
            ->firstOrCreate(
                [],
                [
                    'employee_number' => 'TECH-TEST-001',
                    'phone' => '09171234567',
                    'introduction' =>
                        'Experienced field-service technician.',
                    'specialization' =>
                        'General Field Service',
                    'qualifications' =>
                        'General repair and field-service support.',
                    'availability_notes' =>
                        'Available during regular business hours.',
                    'is_active' => true,
                ]
            );

        $customerUser = User::updateOrCreate(
            [
                'email' =>
                    'juan.delacruz@example.test',
            ],
            [
                'name' => 'Juan Dela Cruz',
                'role' => 'customer',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $customerUser
            ->customer()
            ->firstOrCreate(
                [],
                [
                    'name' => 'Juan Dela Cruz',
                    'contact_person' => 'Juan Dela Cruz',
                    'email' =>
                        'juan.delacruz@example.test',
                    'phone' => '09171234567',
                    'address' =>
                        'Quezon City, Philippines',
                ]
            );
    }
}