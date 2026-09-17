<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\JobOrderScheduleRevision;
use App\Models\JobOrderStatusHistory;
use App\Models\Technician;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JobOrderSchedulingService
{
    public function __construct(
        private readonly TechnicianAvailabilityService
            $availabilityService
    ) {
    }

    /**
     * Assign or update the official schedule without changing technicians.
     *
     * @param array<string, mixed> $data
     */
    public function schedule(
        JobOrder $jobOrder,
        User $scheduledBy,
        array $data
    ): JobOrder {
        return DB::transaction(function () use (
            $jobOrder,
            $scheduledBy,
            $data
        ): JobOrder {
            /*
             * Read the immutable customer selection, then lock the technician
             * before the job order. Technician acceptance uses the same lock
             * order, reducing concurrent scheduling deadlocks.
             */
            $selectedTechnicianId = JobOrder::query()
                ->whereKey($jobOrder->id)
                ->value('selected_technician_id');

            if ($selectedTechnicianId === null) {
                throw ValidationException::withMessages([
                    'selected_technician_id' => [
                        'The customer must select a technician before scheduling.',
                    ],
                ]);
            }

            $technician = Technician::query()
                ->lockForUpdate()
                ->find($selectedTechnicianId);

            $lockedJobOrder = JobOrder::query()
                ->lockForUpdate()
                ->findOrFail($jobOrder->id);

            if (
                $lockedJobOrder->selected_technician_id
                !== $selectedTechnicianId
            ) {
                throw ValidationException::withMessages([
                    'selected_technician_id' => [
                        'The technician selection changed. Refresh the request and try again.',
                    ],
                ])->status(409);
            }

            if (! in_array(
                $lockedJobOrder->status,
                JobOrder::SCHEDULING_STATUSES,
                true
            )) {
                throw ValidationException::withMessages([
                    'job_order' => [
                        'This request is not waiting for scheduling or rescheduling.',
                    ],
                ]);
            }

            if (! $technician || ! $technician->is_active) {
                throw ValidationException::withMessages([
                    'selected_technician_id' => [
                        'The customer-selected technician is currently inactive.',
                    ],
                ]);
            }

            $scheduledAt = CarbonImmutable::parse(
                $data['scheduled_at']
            )->utc();

            $scheduledEndAt = CarbonImmutable::parse(
                $data['scheduled_end_at']
            )->utc();

            if ($scheduledEndAt->lessThanOrEqualTo($scheduledAt)) {
                throw ValidationException::withMessages([
                    'scheduled_end_at' => [
                        'The scheduled end must be after the scheduled start.',
                    ],
                ]);
            }

            $conflict = $this->availabilityService->firstConflict(
                $technician,
                $scheduledAt,
                $scheduledEndAt,
                $lockedJobOrder->id,
                true
            );

            if ($conflict !== null) {
                throw ValidationException::withMessages([
                    'scheduled_at' => [
                        "The selected technician already has an active schedule during this period ({$conflict->job_order_number}).",
                    ],
                ])->status(409);
            }

            $previousStatus = $lockedJobOrder->status;
            $previousVersion = $lockedJobOrder->schedule_version;
            $newVersion = $previousVersion + 1;

            $isReschedule = $previousVersion > 0
                || $lockedJobOrder->scheduled_at !== null;

            $previousSchedule = [
                'scheduled_at' =>
                    $lockedJobOrder->scheduled_at?->toIso8601String(),
                'scheduled_end_at' =>
                    $lockedJobOrder->scheduled_end_at?->toIso8601String(),
                'schedule_version' => $previousVersion,
            ];

            $lockedJobOrder->update([
                'scheduled_at' => $scheduledAt,
                'scheduled_end_at' => $scheduledEndAt,
                'schedule_version' => $newVersion,
                'scheduled_by' => $scheduledBy->id,
                'status' => 'pending_technician_response',
            ]);

            $revision = JobOrderScheduleRevision::create([
                'job_order_id' => $lockedJobOrder->id,
                'version' => $newVersion,
                'scheduled_at' => $scheduledAt,
                'scheduled_end_at' => $scheduledEndAt,
                'scheduled_by' => $scheduledBy->id,
                'remarks' => $data['remarks'] ?? null,
            ]);

            JobOrderStatusHistory::create([
                'job_order_id' => $lockedJobOrder->id,
                'previous_status' => $previousStatus,
                'status' => 'pending_technician_response',
                'action' => $isReschedule
                    ? 'dispatcher_rescheduled'
                    : 'dispatcher_scheduled',
                'changed_by' => $scheduledBy->id,
                'remarks' => $data['remarks'] ?? (
                    $isReschedule
                        ? 'Dispatcher updated the official schedule.'
                        : 'Dispatcher assigned the official schedule.'
                ),
                'metadata' => [
                    'schedule_revision_id' => $revision->id,
                    'selected_technician_id' => $technician->id,
                    'previous_schedule' => $previousSchedule,
                    'new_schedule' => [
                        'scheduled_at' =>
                            $scheduledAt->toIso8601String(),
                        'scheduled_end_at' =>
                            $scheduledEndAt->toIso8601String(),
                        'schedule_version' => $newVersion,
                    ],
                ],
            ]);

            return $lockedJobOrder->fresh();
        });
    }
}