<?php

namespace Tests\Feature;

use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerTechnicianProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_browse_at_least_three_active_technicians(): void
    {
        $this->authenticateAs('customer');

        $this->createTechnician('Technician One', 'TECH-001');
        $this->createTechnician('Technician Two', 'TECH-002');
        $this->createTechnician('Technician Three', 'TECH-003');
        $this->createTechnician('Technician Four', 'TECH-004');
        $this->createTechnician(
            'Inactive Technician',
            'TECH-005',
            false
        );

        $response = $this->getJson(
            '/api/customer/technicians?per_page=3'
        );

        $response
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.total', 4)
            ->assertJsonPath('data.0.name', 'Technician One')
            ->assertJsonPath('data.1.name', 'Technician Two')
            ->assertJsonPath('data.2.name', 'Technician Three')
            ->assertJsonMissing([
                'name' => 'Inactive Technician',
            ]);

        $firstProfile = $response->json('data.0');

        $this->assertArrayNotHasKey('user', $firstProfile);
        $this->assertArrayNotHasKey('user_id', $firstProfile);
        $this->assertArrayNotHasKey('profile_photo_path', $firstProfile);
        $this->assertArrayNotHasKey('created_at', $firstProfile);
        $this->assertArrayNotHasKey('updated_at', $firstProfile);
    }

    public function test_customer_can_view_an_active_technician_profile(): void
    {
        $this->authenticateAs('customer');

        $technician = $this->createTechnician(
            'Ana Technician',
            'TECH-101',
            true,
            [
                'introduction' => 'Air-conditioning service specialist.',
                'specialization' => 'HVAC',
                'qualifications' => 'TESDA certified technician.',
                'availability_notes' => 'Available Monday to Friday.',
            ]
        );

        $response = $this->getJson(
            "/api/customer/technicians/{$technician->id}"
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $technician->id)
            ->assertJsonPath('data.name', 'Ana Technician')
            ->assertJsonPath('data.specialization', 'HVAC')
            ->assertJsonPath(
                'data.qualifications',
                'TESDA certified technician.'
            )
            ->assertJsonPath('data.is_active', true);
    }

    public function test_customer_cannot_view_an_inactive_technician(): void
    {
        $this->authenticateAs('customer');

        $technician = $this->createTechnician(
            'Inactive Technician',
            'TECH-201',
            false
        );

        $this->getJson(
            "/api/customer/technicians/{$technician->id}"
        )->assertNotFound();
    }

    public function test_list_requires_a_minimum_page_size_of_three(): void
    {
        $this->authenticateAs('customer');

        $this->getJson('/api/customer/technicians?per_page=2')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }

    public function test_non_customer_cannot_access_customer_profiles(): void
    {
        $this->authenticateAs('dispatcher');

        $this->getJson('/api/customer/technicians')
            ->assertForbidden();
    }

    public function test_guest_cannot_access_customer_profiles(): void
    {
        $this->getJson('/api/customer/technicians')
            ->assertUnauthorized();
    }

    private function authenticateAs(string $role): User
    {
        $user = User::factory()->create([
            'role' => $role,
        ]);

        Sanctum::actingAs($user);

        return $user;
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createTechnician(
        string $name,
        string $employeeNumber,
        bool $isActive = true,
        array $overrides = []
    ): Technician {
        $user = User::factory()->create([
            'name' => $name,
            'role' => 'technician',
        ]);

        return Technician::create([
            'user_id' => $user->id,
            'employee_number' => $employeeNumber,
            'phone' => '09171234567',
            'profile_photo_path' => null,
            'introduction' => 'Experienced field technician.',
            'specialization' => 'General repair',
            'qualifications' => 'Certified service technician.',
            'availability_notes' => 'Contact for schedule availability.',
            'is_active' => $isActive,
            ...$overrides,
        ]);
    }
}