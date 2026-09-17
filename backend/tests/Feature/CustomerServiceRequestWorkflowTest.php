<?php

namespace Tests\Feature;

use App\Models\JobOrder;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerServiceRequestWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_must_select_a_technician(): void
    {
        $this->createAuthenticatedCustomer();

        $this->postJson('/api/customer/service-requests', [
            'title' => 'Air conditioner repair',
            'description' => 'The unit is not cooling.',
            'service_address' => '123 Test Street',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(
                'selected_technician_id'
            );
    }

    public function test_customer_cannot_select_an_inactive_technician(): void
    {
        $this->createAuthenticatedCustomer();
        $technician = $this->createTechnician(false);

        $this->postJson('/api/customer/service-requests', [
            ...$this->validPayload(),
            'selected_technician_id' => $technician->id,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(
                'selected_technician_id'
            );

        $this->assertDatabaseCount('job_orders', 0);
    }

    public function test_customer_can_create_request_with_active_technician(): void
    {
        [$customerUser, $customer] =
            $this->createAuthenticatedCustomer();

        $technician = $this->createTechnician(true);

        $response = $this->postJson(
            '/api/customer/service-requests',
            [
                ...$this->validPayload(),
                'selected_technician_id' => $technician->id,
            ]
        );

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.selected_technician_id',
                $technician->id
            )
            ->assertJsonPath(
                'data.selected_technician.id',
                $technician->id
            )
            ->assertJsonPath(
                'data.status',
                'pending_schedule'
            )
            ->assertJsonPath(
                'data.schedule_version',
                0
            );

        $jobOrder = JobOrder::query()->firstOrFail();

        $this->assertSame($customer->id, $jobOrder->customer_id);
        $this->assertSame(
            $customerUser->id,
            $jobOrder->created_by
        );
        $this->assertSame(
            $technician->id,
            $jobOrder->selected_technician_id
        );
        $this->assertSame('pending_schedule', $jobOrder->status);
        $this->assertNull($jobOrder->scheduled_at);
        $this->assertNull($jobOrder->scheduled_end_at);

        $history = $jobOrder
            ->statusHistories()
            ->firstOrFail();

        $this->assertNull($history->previous_status);
        $this->assertSame(
            'pending_schedule',
            $history->status
        );
        $this->assertSame(
            'customer_submitted',
            $history->action
        );
        $this->assertSame(
            $technician->id,
            $history->metadata['selected_technician_id']
        );

        $selectedProfile = $response->json(
            'data.selected_technician'
        );

        $this->assertArrayNotHasKey('user', $selectedProfile);
        $this->assertArrayNotHasKey(
            'user_id',
            $selectedProfile
        );
        $this->assertArrayNotHasKey(
            'profile_photo_path',
            $selectedProfile
        );
    }

    public function test_customer_can_filter_own_requests_by_new_status(): void
    {
        $this->createAuthenticatedCustomer();
        $technician = $this->createTechnician(true);

        $this->postJson('/api/customer/service-requests', [
            ...$this->validPayload(),
            'selected_technician_id' => $technician->id,
        ])->assertCreated();

        $this->getJson(
            '/api/customer/service-requests?status=pending_schedule'
        )
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath(
                'data.data.0.status',
                'pending_schedule'
            );
    }

    public function test_customer_cannot_view_another_customers_request(): void
    {
        $this->createAuthenticatedCustomer();
        $technician = $this->createTechnician(true);

        $creationResponse = $this->postJson(
            '/api/customer/service-requests',
            [
                ...$this->validPayload(),
                'selected_technician_id' => $technician->id,
            ]
        )->assertCreated();

        $jobOrderId = $creationResponse->json('data.id');

        $this->createAuthenticatedCustomer();

        $this->getJson(
            "/api/customer/service-requests/{$jobOrderId}"
        )->assertNotFound();
    }

    /**
     * @return array{0: User, 1: \App\Models\Customer}
     */
    private function createAuthenticatedCustomer(): array
    {
        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $customer = $user->customer()->create([
            'name' => $user->name,
            'contact_person' => $user->name,
            'email' => $user->email,
            'phone' => '09170000001',
            'address' => '123 Customer Street',
        ]);

        Sanctum::actingAs($user);

        return [$user, $customer];
    }

    private function createTechnician(
        bool $isActive
    ): Technician {
        $user = User::factory()->create([
            'role' => 'technician',
        ]);

        return $user->technician()->create([
            'employee_number' =>
                'TECH-'.str_pad(
                    (string) $user->id,
                    5,
                    '0',
                    STR_PAD_LEFT
                ),
            'phone' => '09170000002',
            'introduction' => 'Experienced repair technician.',
            'specialization' => 'General repair',
            'qualifications' => 'Certified technician.',
            'availability_notes' =>
                'Available during regular service hours.',
            'is_active' => $isActive,
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function validPayload(): array
    {
        return [
            'title' => 'Air conditioner repair',
            'description' => 'The unit is not cooling.',
            'service_address' => '123 Test Street',
        ];
    }
}