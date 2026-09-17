<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\JobOrderStatusHistory;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BackendAuthorizationRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_all_requests_and_history(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        JobOrderStatusHistory::create([
            'job_order_id' => $jobOrder->id,
            'previous_status' => null,
            'status' => 'pending_schedule',
            'action' => 'customer_submitted',
            'changed_by' => $customerUser->id,
            'remarks' => 'Customer submitted request.',
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/job-orders')
            ->assertOk()
            ->assertJsonPath(
                'data.data.0.id',
                $jobOrder->id
            );

        $this->getJson(
            "/api/job-orders/{$jobOrder->id}/status-history"
        )
            ->assertOk()
            ->assertJsonPath(
                'data.data.0.action',
                'customer_submitted'
            );
    }

    public function test_admin_can_cancel_active_request(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician,
            'pending_schedule'
        );

        Sanctum::actingAs($admin);

        $this->patchJson(
            "/api/job-orders/{$jobOrder->id}/status",
            [
                'status' => 'cancelled',
                'remarks' =>
                    'Cancelled after administrative review.',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'data.job_order.status',
                'cancelled'
            )
            ->assertJsonPath(
                'data.status_history.action',
                'admin_cancelled'
            )
            ->assertJsonPath(
                'data.status_history.previous_status',
                'pending_schedule'
            );
    }

    public function test_admin_can_close_completed_request(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician,
            'completed'
        );

        Sanctum::actingAs($admin);

        $this->patchJson(
            "/api/job-orders/{$jobOrder->id}/status",
            [
                'status' => 'closed',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'data.job_order.status',
                'closed'
            )
            ->assertJsonPath(
                'data.status_history.action',
                'admin_closed'
            );

        $this->assertNotNull(
            $jobOrder->fresh()->closed_at
        );
    }

    public function test_admin_cannot_force_technician_workflow_statuses(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        Sanctum::actingAs($admin);

        foreach (
            ['accepted', 'in_progress', 'completed']
            as $forbiddenStatus
        ) {
            $this->patchJson(
                "/api/job-orders/{$jobOrder->id}/status",
                [
                    'status' => $forbiddenStatus,
                ]
            )
                ->assertUnprocessable()
                ->assertJsonValidationErrors('status');
        }

        $this->assertSame(
            'pending_schedule',
            $jobOrder->fresh()->status
        );
    }

    public function test_admin_cannot_modify_workflow_controlled_fields(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $selectedTechnician =
            $this->createTechnician();

        $replacementTechnician =
            $this->createTechnician();

        [, $otherCustomer] =
            $this->createCustomer();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $selectedTechnician
        );

        Sanctum::actingAs($admin);

        $this->putJson(
            "/api/job-orders/{$jobOrder->id}",
            [
                'customer_id' => $otherCustomer->id,
                'selected_technician_id' =>
                    $replacementTechnician->id,
                'status' => 'accepted',
                'scheduled_at' =>
                    now()->addDay()->toIso8601String(),
                'scheduled_end_at' =>
                    now()->addDay()->addHour()->toIso8601String(),
            ]
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'customer_id',
                'selected_technician_id',
                'status',
                'scheduled_at',
                'scheduled_end_at',
            ]);

        $jobOrder->refresh();

        $this->assertSame(
            $customer->id,
            $jobOrder->customer_id
        );

        $this->assertSame(
            $selectedTechnician->id,
            $jobOrder->selected_technician_id
        );

        $this->assertSame(
            'pending_schedule',
            $jobOrder->status
        );

        $this->assertNull($jobOrder->scheduled_at);
    }

    public function test_unsafe_legacy_write_routes_are_retired(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        Sanctum::actingAs($admin);

        $this->postJson('/api/job-orders', [
            'customer_id' => $customer->id,
            'title' => 'Legacy request',
        ])->assertStatus(405);

        $this->deleteJson(
            "/api/job-orders/{$jobOrder->id}"
        )->assertStatus(405);

        $this->postJson(
            "/api/job-orders/{$jobOrder->id}/assignments",
            [
                'technician_id' => $technician->id,
            ]
        )->assertNotFound();
    }

    public function test_dispatcher_cannot_use_admin_write_routes(): void
    {
        $dispatcher = $this->createUser('dispatcher');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        Sanctum::actingAs($dispatcher);

        $this->patchJson(
            "/api/job-orders/{$jobOrder->id}/status",
            [
                'status' => 'cancelled',
            ]
        )->assertForbidden();

        $this->putJson(
            "/api/job-orders/{$jobOrder->id}",
            [
                'title' => 'Unauthorized dispatcher edit',
            ]
        )->assertForbidden();

        $this->assertSame(
            'pending_schedule',
            $jobOrder->fresh()->status
        );
    }

    public function test_admin_cannot_read_private_conversation(): void
    {
        $admin = $this->createUser('admin');

        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        $conversation = Conversation::create([
            'job_order_id' => $jobOrder->id,
        ]);

        $conversation->participants()->attach([
            $customerUser->id => [
                'participant_role' => 'customer',
            ],
            $technician->user_id => [
                'participant_role' => 'technician',
            ],
        ]);

        Sanctum::actingAs($admin);

        $this->getJson(
            "/api/conversations/{$conversation->id}"
        )->assertForbidden();
    }

    private function createUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
        ]);
    }

    /**
     * @return array{0: User, 1: Customer}
     */
    private function createCustomer(): array
    {
        $user = $this->createUser('customer');

        $customer = $user->customer()->create([
            'name' => $user->name,
            'contact_person' => $user->name,
            'email' => $user->email,
            'phone' => '09170000001',
            'address' => 'Test customer address',
        ]);

        return [$user, $customer];
    }

    private function createTechnician(): Technician
    {
        $user = $this->createUser('technician');

        return $user->technician()->create([
            'employee_number' =>
                'TECH-'.Str::upper(Str::random(10)),
            'phone' => '09170000002',
            'specialization' => 'General repair',
            'is_active' => true,
        ]);
    }

    private function createJobOrder(
        User $customerUser,
        Customer $customer,
        Technician $technician,
        string $status = 'pending_schedule'
    ): JobOrder {
        return JobOrder::create([
            'job_order_number' =>
                'JO-'.Str::upper(Str::random(14)),
            'customer_id' => $customer->id,
            'selected_technician_id' => $technician->id,
            'created_by' => $customerUser->id,
            'title' => 'Authorization test request',
            'description' => 'Test repair request.',
            'service_address' => 'Test service address',
            'priority' => 'normal',
            'status' => $status,
            'schedule_version' => 0,
        ]);
    }
}