<?php

namespace Tests\Feature;

use App\Models\JobOrder;
use App\Models\JobOrderStatusHistory;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class JobOrderWorkflowSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_workflow_schema_contains_required_columns_and_tables(): void
    {
        $this->assertTrue(
            Schema::hasColumns('job_orders', [
                'selected_technician_id',
                'scheduled_at',
                'scheduled_end_at',
                'schedule_version',
                'scheduled_by',
            ])
        );

        $this->assertTrue(
            Schema::hasColumns('job_order_status_history', [
                'previous_status',
                'status',
                'action',
                'changed_by',
                'remarks',
                'metadata',
            ])
        );

        $this->assertTrue(
            Schema::hasTable('job_order_schedule_revisions')
        );

        $this->assertTrue(
            Schema::hasTable('job_order_technician_responses')
        );
    }

    public function test_models_preserve_schedule_and_response_audit_data(): void
    {
        $customerUser = User::factory()->create([
            'role' => 'customer',
        ]);

        $customer = $customerUser->customer()->create([
            'name' => $customerUser->name,
            'contact_person' => $customerUser->name,
            'email' => $customerUser->email,
            'phone' => '09170000001',
            'address' => 'Test service address',
        ]);

        $technicianUser = User::factory()->create([
            'role' => 'technician',
        ]);

        $technician = $technicianUser->technician()->create([
            'employee_number' => 'TECH-PHASE-2',
            'phone' => '09170000002',
            'specialization' => 'General repair',
            'is_active' => true,
        ]);

        $dispatcher = User::factory()->create([
            'role' => 'dispatcher',
        ]);

        $scheduledAt = now()->addDay()->startOfHour();
        $scheduledEndAt = $scheduledAt->copy()->addHours(2);

        $jobOrder = JobOrder::create([
            'job_order_number' => 'JO-PHASE-2-0001',
            'customer_id' => $customer->id,
            'selected_technician_id' => $technician->id,
            'created_by' => $customerUser->id,
            'title' => 'Phase 2 workflow test',
            'description' => 'Schema relationship verification.',
            'service_address' => 'Test service address',
            'priority' => 'normal',
            'status' => 'pending_technician_response',
            'scheduled_at' => $scheduledAt,
            'scheduled_end_at' => $scheduledEndAt,
            'schedule_version' => 1,
            'scheduled_by' => $dispatcher->id,
        ]);

        $revision = $jobOrder->scheduleRevisions()->create([
            'version' => 1,
            'scheduled_at' => $scheduledAt,
            'scheduled_end_at' => $scheduledEndAt,
            'scheduled_by' => $dispatcher->id,
            'remarks' => 'Initial official schedule.',
        ]);

        $technicianResponse = $jobOrder
            ->technicianResponses()
            ->create([
                'schedule_revision_id' => $revision->id,
                'technician_id' => $technician->id,
                'responded_by' => $technicianUser->id,
                'response' => 'accepted',
                'response_notes' => 'Schedule accepted.',
                'responded_at' => now(),
            ]);

        $history = JobOrderStatusHistory::create([
            'job_order_id' => $jobOrder->id,
            'previous_status' => 'pending_schedule',
            'status' => 'pending_technician_response',
            'action' => 'scheduled',
            'changed_by' => $dispatcher->id,
            'remarks' => 'Dispatcher assigned the official schedule.',
            'metadata' => [
                'schedule_version' => 1,
            ],
        ]);

        $jobOrder->refresh()->load([
            'selectedTechnician',
            'scheduledBy',
            'latestScheduleRevision',
            'technicianResponses',
        ]);

        $this->assertTrue(
            $jobOrder->selectedTechnician->is($technician)
        );

        $this->assertTrue(
            $jobOrder->scheduledBy->is($dispatcher)
        );

        $this->assertTrue(
            $jobOrder->latestScheduleRevision->is($revision)
        );

        $this->assertTrue(
            $jobOrder->technicianResponses
                ->first()
                ->is($technicianResponse)
        );

        $this->assertSame(
            1,
            $history->fresh()->metadata['schedule_version']
        );
    }
}