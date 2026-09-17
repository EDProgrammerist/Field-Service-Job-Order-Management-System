<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\JobOrderScheduleRevision;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AvailabilityEnforcementTest extends TestCase
{
    use RefreshDatabase;

    public function test_back_to_back_schedules_are_allowed(): void
    {
        $dispatcher = $this->createUser('dispatcher');
        $technician = $this->createTechnician();

        $start = now()->addDays(3)->startOfHour();
        $existingEnd = $start->copy()->addHours(2);

        $this->createJobOrder(
            $technician,
            'accepted',
            [
                'scheduled_at' => $start,
                'scheduled_end_at' => $existingEnd,
                'schedule_version' => 1,
                'scheduled_by' => $dispatcher->id,
            ]
        );

        $newJob = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        Sanctum::actingAs($dispatcher);

        $this->patchJson(
            "/api/dispatcher/job-orders/{$newJob->id}/schedule",
            [
                'scheduled_at' =>
                    $existingEnd->toIso8601String(),
                'scheduled_end_at' =>
                    $existingEnd
                        ->copy()
                        ->addHours(2)
                        ->toIso8601String(),
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.schedule_version', 1);

        Sanctum::actingAs($technician->user);

        $this->postJson(
            "/api/technician/job-orders/{$newJob->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');
    }

    public function test_pending_responses_do_not_reserve_the_schedule(): void
    {
        $dispatcher = $this->createUser('dispatcher');
        $technician = $this->createTechnician();

        $firstJob = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        $secondJob = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        $start = now()->addDays(4)->startOfHour();
        $end = $start->copy()->addHours(2);

        Sanctum::actingAs($dispatcher);

        foreach ([$firstJob, $secondJob] as $jobOrder) {
            $this->patchJson(
                "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
                [
                    'scheduled_at' => $start->toIso8601String(),
                    'scheduled_end_at' => $end->toIso8601String(),
                ]
            )
                ->assertOk()
                ->assertJsonPath(
                    'data.status',
                    'pending_technician_response'
                );
        }

        Sanctum::actingAs($technician->user);

        $this->postJson(
            "/api/technician/job-orders/{$firstJob->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )->assertOk();

        $this->postJson(
            "/api/technician/job-orders/{$secondJob->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )
            ->assertStatus(409)
            ->assertJsonValidationErrors('scheduled_at');

        $secondJob->refresh();

        $this->assertSame(
            'pending_technician_response',
            $secondJob->status
        );

        $this->assertDatabaseMissing(
            'job_order_technician_responses',
            [
                'job_order_id' => $secondJob->id,
            ]
        );
    }

    public function test_rescheduled_request_requires_current_schedule_version(): void
    {
        $dispatcher = $this->createUser('dispatcher');
        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        $firstStart = now()->addDays(2)->startOfHour();
        $firstEnd = $firstStart->copy()->addHours(2);

        Sanctum::actingAs($dispatcher);

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $firstStart->toIso8601String(),
                'scheduled_end_at' => $firstEnd->toIso8601String(),
            ]
        )->assertOk();

        $firstRevision = JobOrderScheduleRevision::query()
            ->where('job_order_id', $jobOrder->id)
            ->where('version', 1)
            ->firstOrFail();

        Sanctum::actingAs($technician->user);

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/reject",
            [
                'schedule_version' => 1,
                'reason' => 'Unavailable at the first time.',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'technician_rejected'
            );

        $secondStart = now()->addDays(5)->startOfHour();
        $secondEnd = $secondStart->copy()->addHours(2);

        Sanctum::actingAs($dispatcher);

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' =>
                    $secondStart->toIso8601String(),
                'scheduled_end_at' =>
                    $secondEnd->toIso8601String(),
                'remarks' => 'Rescheduled after rejection.',
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.schedule_version', 2)
            ->assertJsonPath(
                'data.status',
                'pending_technician_response'
            );

        $secondRevision = JobOrderScheduleRevision::query()
            ->where('job_order_id', $jobOrder->id)
            ->where('version', 2)
            ->firstOrFail();

        Sanctum::actingAs($technician->user);

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )
            ->assertStatus(409)
            ->assertJsonValidationErrors('schedule_version');

        $this->assertDatabaseCount(
            'job_order_technician_responses',
            1
        );

        $this->assertDatabaseHas(
            'job_order_technician_responses',
            [
                'schedule_revision_id' => $firstRevision->id,
                'response' => 'rejected',
            ]
        );

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/accept",
            [
                'schedule_version' => 2,
                'remarks' => 'The new schedule works.',
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $this->assertDatabaseHas(
            'job_order_technician_responses',
            [
                'schedule_revision_id' => $secondRevision->id,
                'response' => 'accepted',
            ]
        );

        $this->assertDatabaseCount(
            'job_order_schedule_revisions',
            2
        );

        $this->assertDatabaseCount(
            'job_order_technician_responses',
            2
        );
    }

    public function test_inactive_technician_is_reported_unavailable_and_cannot_accept(): void
    {
        $dispatcher = $this->createUser('dispatcher');
        $technician = $this->createTechnician(false);

        $start = now()->addDays(3)->startOfHour();
        $end = $start->copy()->addHours(2);

        $jobOrder = $this->createJobOrder(
            $technician,
            'pending_technician_response',
            [
                'scheduled_at' => $start,
                'scheduled_end_at' => $end,
                'schedule_version' => 1,
                'scheduled_by' => $dispatcher->id,
            ]
        );

        JobOrderScheduleRevision::create([
            'job_order_id' => $jobOrder->id,
            'version' => 1,
            'scheduled_at' => $start,
            'scheduled_end_at' => $end,
            'scheduled_by' => $dispatcher->id,
            'remarks' => 'Existing test schedule.',
        ]);

        Sanctum::actingAs($dispatcher);

        $query = http_build_query([
            'from' => $start->toIso8601String(),
            'to' => $end->toIso8601String(),
        ]);

        $this->getJson(
            "/api/dispatcher/technicians/{$technician->id}/availability?{$query}"
        )
            ->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.is_available', false)
            ->assertJsonCount(0, 'data.conflicts');

        Sanctum::actingAs($technician->user);

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('technician');

        $jobOrder->refresh();

        $this->assertSame(
            'pending_technician_response',
            $jobOrder->status
        );
    }

    public function test_finished_rejected_and_cancelled_work_do_not_block_schedule(): void
    {
        $dispatcher = $this->createUser('dispatcher');
        $technician = $this->createTechnician();

        $start = now()->addDays(4)->startOfHour();
        $end = $start->copy()->addHours(2);

        foreach (
            ['completed', 'technician_rejected', 'cancelled']
            as $status
        ) {
            $this->createJobOrder(
                $technician,
                $status,
                [
                    'scheduled_at' => $start,
                    'scheduled_end_at' => $end,
                    'schedule_version' => 1,
                    'scheduled_by' => $dispatcher->id,
                ]
            );
        }

        $jobOrder = $this->createJobOrder(
            $technician,
            'pending_schedule'
        );

        Sanctum::actingAs($dispatcher);

        $query = http_build_query([
            'from' => $start->toIso8601String(),
            'to' => $end->toIso8601String(),
        ]);

        $this->getJson(
            "/api/dispatcher/technicians/{$technician->id}/availability?{$query}"
        )
            ->assertOk()
            ->assertJsonPath('data.is_available', true)
            ->assertJsonCount(0, 'data.conflicts');

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $start->toIso8601String(),
                'scheduled_end_at' => $end->toIso8601String(),
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'pending_technician_response'
            );
    }

    private function createUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
        ]);
    }

    private function createTechnician(
        bool $isActive = true
    ): Technician {
        $user = $this->createUser('technician');

        return $user->technician()->create([
            'employee_number' =>
                'TECH-'.Str::upper(Str::random(10)),
            'phone' => '09170000002',
            'specialization' => 'General repair',
            'is_active' => $isActive,
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
        $customerUser = $this->createUser('customer');

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
                'JO-'.Str::upper(Str::random(14)),
            'customer_id' => $customer->id,
            'selected_technician_id' => $technician->id,
            'created_by' => $customerUser->id,
            'title' => 'Availability test request',
            'description' => 'Test repair request.',
            'service_address' => 'Test service address',
            'priority' => 'normal',
            'status' => $status,
            'schedule_version' => 0,
            ...$overrides,
        ]);
    }
}