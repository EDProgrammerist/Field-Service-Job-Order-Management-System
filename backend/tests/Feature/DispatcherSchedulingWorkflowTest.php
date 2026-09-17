<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\JobOrderScheduleRevision;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DispatcherSchedulingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatcher_can_assign_official_schedule(): void
    {
        $dispatcher = $this->authenticateAs('dispatcher');
        $technician = $this->createTechnician();
        $jobOrder = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        $scheduledAt = now()->addDays(2)->startOfHour();
        $scheduledEndAt = $scheduledAt->copy()->addHours(2);

        $response = $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' =>
                    $scheduledAt->toIso8601String(),
                'scheduled_end_at' =>
                    $scheduledEndAt->toIso8601String(),
                'remarks' => 'Initial official schedule.',
            ]
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'pending_technician_response'
            )
            ->assertJsonPath('data.schedule_version', 1)
            ->assertJsonPath(
                'data.selected_technician_id',
                $technician->id
            )
            ->assertJsonPath(
                'data.latest_schedule_revision.version',
                1
            );

        $jobOrder->refresh();

        $this->assertSame(
            'pending_technician_response',
            $jobOrder->status
        );
        $this->assertSame(1, $jobOrder->schedule_version);
        $this->assertSame(
            $dispatcher->id,
            $jobOrder->scheduled_by
        );
        $this->assertSame(
            $technician->id,
            $jobOrder->selected_technician_id
        );

        $this->assertDatabaseHas(
            'job_order_schedule_revisions',
            [
                'job_order_id' => $jobOrder->id,
                'version' => 1,
                'scheduled_by' => $dispatcher->id,
            ]
        );

        $history = $jobOrder
            ->statusHistories()
            ->latest('id')
            ->firstOrFail();

        $this->assertSame(
            'dispatcher_scheduled',
            $history->action
        );
        $this->assertSame(
            $dispatcher->id,
            $history->changed_by
        );
    }

    public function test_dispatcher_can_reschedule_rejected_request(): void
    {
        $dispatcher = $this->authenticateAs('dispatcher');
        $technician = $this->createTechnician();

        $oldStart = now()->addDay()->startOfHour();
        $oldEnd = $oldStart->copy()->addHour();

        $jobOrder = $this->createJobOrder(
            $technician,
            'technician_rejected',
            [
                'scheduled_at' => $oldStart,
                'scheduled_end_at' => $oldEnd,
                'schedule_version' => 1,
                'scheduled_by' => $dispatcher->id,
            ]
        );

        JobOrderScheduleRevision::create([
            'job_order_id' => $jobOrder->id,
            'version' => 1,
            'scheduled_at' => $oldStart,
            'scheduled_end_at' => $oldEnd,
            'scheduled_by' => $dispatcher->id,
            'remarks' => 'Rejected schedule.',
        ]);

        $newStart = now()->addDays(3)->startOfHour();
        $newEnd = $newStart->copy()->addHours(2);

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' =>
                    $newStart->toIso8601String(),
                'scheduled_end_at' =>
                    $newEnd->toIso8601String(),
                'remarks' => 'Rescheduled after rejection.',
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.schedule_version', 2)
            ->assertJsonPath(
                'data.status',
                'pending_technician_response'
            );

        $this->assertDatabaseCount(
            'job_order_schedule_revisions',
            2
        );

        $history = $jobOrder
            ->statusHistories()
            ->latest('id')
            ->firstOrFail();

        $this->assertSame(
            'dispatcher_rescheduled',
            $history->action
        );
    }

    public function test_overlapping_active_schedule_returns_conflict(): void
    {
        $this->authenticateAs('dispatcher');
        $technician = $this->createTechnician();

        $start = now()->addDays(2)->startOfHour();

        $this->createJobOrder(
            $technician,
            'accepted',
            [
                'scheduled_at' => $start->copy()->addHour(),
                'scheduled_end_at' =>
                    $start->copy()->addHours(3),
                'schedule_version' => 1,
            ]
        );

        $jobOrder = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $start->toIso8601String(),
                'scheduled_end_at' =>
                    $start->copy()
                        ->addHours(2)
                        ->toIso8601String(),
            ]
        )
            ->assertStatus(409)
            ->assertJsonValidationErrors('scheduled_at');

        $jobOrder->refresh();

        $this->assertSame('pending_schedule', $jobOrder->status);
        $this->assertSame(0, $jobOrder->schedule_version);
    }

    public function test_availability_endpoint_returns_conflicts(): void
    {
        $this->authenticateAs('dispatcher');
        $technician = $this->createTechnician();

        $start = now()->addDays(2)->startOfHour();

        $blockingJob = $this->createJobOrder(
            $technician,
            'in_progress',
            [
                'scheduled_at' => $start,
                'scheduled_end_at' =>
                    $start->copy()->addHours(2),
                'schedule_version' => 1,
            ]
        );

        $query = http_build_query([
            'from' => $start
                ->copy()
                ->subHour()
                ->toIso8601String(),
            'to' => $start
                ->copy()
                ->addHours(3)
                ->toIso8601String(),
        ]);

        $this->getJson(
            "/api/dispatcher/technicians/{$technician->id}/availability?{$query}"
        )
            ->assertOk()
            ->assertJsonPath('data.is_available', false)
            ->assertJsonPath(
                'data.conflicts.0.id',
                $blockingJob->id
            );
    }

    public function test_dispatcher_cannot_assign_or_replace_technician(): void
    {
        $this->authenticateAs('dispatcher');

        $selectedTechnician = $this->createTechnician();
        $replacementTechnician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $selectedTechnician,
            'pending_schedule'
        );

        $this->postJson(
            "/api/job-orders/{$jobOrder->id}/assignments",
            [
                'technician_id' => $replacementTechnician->id,
            ]
        )->assertForbidden();

        $this->putJson(
            "/api/job-orders/{$jobOrder->id}",
            [
                'title' => 'Dispatcher attempted update',
            ]
        )->assertForbidden();

        $jobOrder->refresh();

        $this->assertSame(
            $selectedTechnician->id,
            $jobOrder->selected_technician_id
        );
    }

    public function test_non_dispatcher_cannot_schedule_request(): void
    {
        $this->authenticateAs('customer');
        $technician = $this->createTechnician();
        $jobOrder = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        $start = now()->addDays(2)->startOfHour();

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $start->toIso8601String(),
                'scheduled_end_at' =>
                    $start->copy()
                        ->addHour()
                        ->toIso8601String(),
            ]
        )->assertForbidden();
    }

    private function authenticateAs(string $role): User
    {
        $user = User::factory()->create([
            'role' => $role,
        ]);

        Sanctum::actingAs($user);

        return $user;
    }

    private function createTechnician(): Technician
    {
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
            'specialization' => 'General repair',
            'is_active' => true,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createJobOrder(
        Technician $technician,
        string $status,
        array $overrides = []
    ): JobOrder {
        $customerUser = User::factory()->create([
            'role' => 'customer',
        ]);

        /** @var Customer $customer */
        $customer = $customerUser->customer()->create([
            'name' => $customerUser->name,
            'contact_person' => $customerUser->name,
            'email' => $customerUser->email,
            'phone' => '09170000001',
            'address' => 'Test service address',
        ]);

        return JobOrder::create([
            'job_order_number' =>
                'JO-TEST-'.str_pad(
                    (string) $customerUser->id,
                    6,
                    '0',
                    STR_PAD_LEFT
                ),
            'customer_id' => $customer->id,
            'selected_technician_id' => $technician->id,
            'created_by' => $customerUser->id,
            'title' => 'Repair request',
            'description' => 'Test repair request.',
            'service_address' => 'Test service address',
            'priority' => 'normal',
            'status' => $status,
            'schedule_version' => 0,
            ...$overrides,
        ]);
    }
}