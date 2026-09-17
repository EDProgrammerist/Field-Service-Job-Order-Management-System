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

class TechnicianJobOrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_selected_technician_can_accept_schedule(): void
    {
        [$user, $technician] =
            $this->createAuthenticatedTechnician();

        $jobOrder = $this->createScheduledJobOrder($technician);

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/accept",
            [
                'schedule_version' => 1,
                'remarks' => 'I can attend this schedule.',
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath(
                'data.latest_technician_response.response',
                'accepted'
            );

        $jobOrder->refresh();

        $this->assertSame('accepted', $jobOrder->status);

        $this->assertDatabaseHas(
            'job_order_technician_responses',
            [
                'job_order_id' => $jobOrder->id,
                'technician_id' => $technician->id,
                'responded_by' => $user->id,
                'response' => 'accepted',
            ]
        );

        $history = $jobOrder
            ->statusHistories()
            ->latest('id')
            ->firstOrFail();

        $this->assertSame(
            'technician_accepted',
            $history->action
        );
    }

    public function test_selected_technician_can_reject_schedule(): void
    {
        [$user, $technician] =
            $this->createAuthenticatedTechnician();

        $jobOrder = $this->createScheduledJobOrder($technician);

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/reject",
            [
                'schedule_version' => 1,
                'reason' =>
                    'I am unavailable during this period.',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'technician_rejected'
            )
            ->assertJsonPath(
                'data.latest_technician_response.response',
                'rejected'
            );

        $this->assertDatabaseHas(
            'job_order_technician_responses',
            [
                'job_order_id' => $jobOrder->id,
                'technician_id' => $technician->id,
                'responded_by' => $user->id,
                'response' => 'rejected',
                'response_notes' =>
                    'I am unavailable during this period.',
            ]
        );
    }

    public function test_acceptance_is_blocked_by_overlapping_work(): void
    {
        [, $technician] =
            $this->createAuthenticatedTechnician();

        $start = now()->addDays(2)->startOfHour();

        $this->createScheduledJobOrder(
            $technician,
            'accepted',
            $start,
            $start->copy()->addHours(2)
        );

        $pendingJob = $this->createScheduledJobOrder(
            $technician,
            'pending_technician_response',
            $start->copy()->addHour(),
            $start->copy()->addHours(3)
        );

        $this->postJson(
            "/api/technician/job-orders/{$pendingJob->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )
            ->assertStatus(409)
            ->assertJsonValidationErrors('scheduled_at');

        $pendingJob->refresh();

        $this->assertSame(
            'pending_technician_response',
            $pendingJob->status
        );

        $this->assertDatabaseMissing(
            'job_order_technician_responses',
            [
                'job_order_id' => $pendingJob->id,
            ]
        );
    }

    public function test_selected_technician_can_start_and_complete_work(): void
    {
        [, $technician] =
            $this->createAuthenticatedTechnician();

        $jobOrder = $this->createScheduledJobOrder(
            $technician,
            'accepted'
        );

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/start",
            [
                'remarks' => 'Arrived at service location.',
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.status', 'in_progress');

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/complete",
            [
                'remarks' => 'Repair completed successfully.',
            ]
        )
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $jobOrder->refresh();

        $this->assertSame('completed', $jobOrder->status);
        $this->assertNotNull($jobOrder->completed_at);

        $actions = $jobOrder
            ->statusHistories()
            ->orderBy('id')
            ->pluck('action')
            ->all();

        $this->assertContains(
            'technician_started',
            $actions
        );

        $this->assertContains(
            'technician_completed',
            $actions
        );
    }

    public function test_unrelated_technician_cannot_access_or_update_request(): void
    {
        [, $selectedTechnician] =
            $this->createAuthenticatedTechnician();

        $jobOrder = $this->createScheduledJobOrder(
            $selectedTechnician
        );

        $this->createAuthenticatedTechnician();

        $this->getJson(
            "/api/technician/job-orders/{$jobOrder->id}"
        )->assertForbidden();

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/accept",
            [
                'schedule_version' => 1,
            ]
        )->assertForbidden();

        $this->patchJson(
            "/api/job-orders/{$jobOrder->id}/status",
            [
                'status' => 'in_progress',
            ]
        )->assertForbidden();
    }

    public function test_technician_schedule_only_contains_their_own_work(): void
    {
        [, $technician] =
            $this->createAuthenticatedTechnician();

        $ownJob = $this->createScheduledJobOrder(
            $technician,
            'accepted'
        );

        $otherTechnician = $this->createTechnician();

        $this->createScheduledJobOrder(
            $otherTechnician,
            'accepted'
        );

        $this->getJson('/api/technician/schedule')
            ->assertOk()
            ->assertJsonCount(1, 'data.job_orders')
            ->assertJsonPath(
                'data.job_orders.0.id',
                $ownJob->id
            );
    }

    /**
     * @return array{0: User, 1: Technician}
     */
    private function createAuthenticatedTechnician(): array
    {
        $technician = $this->createTechnician();

        Sanctum::actingAs($technician->user);

        return [$technician->user, $technician];
    }

    private function createTechnician(): Technician
    {
        $user = User::factory()->create([
            'role' => 'technician',
        ]);

        return $user->technician()->create([
            'employee_number' =>
                'TECH-'.Str::upper(Str::random(8)),
            'phone' => '09170000002',
            'specialization' => 'General repair',
            'is_active' => true,
        ]);
    }

    private function createScheduledJobOrder(
        Technician $technician,
        string $status = 'pending_technician_response',
        mixed $scheduledAt = null,
        mixed $scheduledEndAt = null
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

        $dispatcher = User::factory()->create([
            'role' => 'dispatcher',
        ]);

        $scheduledAt ??= now()->addDays(2)->startOfHour();

        $scheduledEndAt ??= $scheduledAt
            ->copy()
            ->addHours(2);

        $jobOrder = JobOrder::create([
            'job_order_number' =>
                'JO-'.Str::upper(Str::random(12)),
            'customer_id' => $customer->id,
            'selected_technician_id' => $technician->id,
            'created_by' => $customerUser->id,
            'title' => 'Repair request',
            'description' => 'Test repair request.',
            'service_address' => 'Test service address',
            'priority' => 'normal',
            'status' => $status,
            'scheduled_at' => $scheduledAt,
            'scheduled_end_at' => $scheduledEndAt,
            'schedule_version' => 1,
            'scheduled_by' => $dispatcher->id,
        ]);

        JobOrderScheduleRevision::create([
            'job_order_id' => $jobOrder->id,
            'version' => 1,
            'scheduled_at' => $scheduledAt,
            'scheduled_end_at' => $scheduledEndAt,
            'scheduled_by' => $dispatcher->id,
            'remarks' => 'Test schedule.',
        ]);

        return $jobOrder;
    }
}