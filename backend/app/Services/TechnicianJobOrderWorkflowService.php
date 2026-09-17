<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\JobOrderScheduleRevision;
use App\Models\JobOrderStatusHistory;
use App\Models\JobOrderTechnicianResponse;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TechnicianJobOrderWorkflowService
{
    public function __construct(
        private readonly TechnicianAvailabilityService
            $availabilityService
    ) {
    }

    public function accept(
        JobOrder $jobOrder,
        User $performedBy,
        int $scheduleVersion,
        ?string $remarks
    ): JobOrder {
        return DB::transaction(function () use (
            $jobOrder,
            $performedBy,
            $scheduleVersion,
            $remarks
        ): JobOrder {
            /*
             * Lock the technician before the job order. Concurrent actions
             * for the same technician will therefore run sequentially.
             */
            $technician = $this->lockTechnician($performedBy);

            if (! $technician->is_active) {
                throw ValidationException::withMessages([
                    'technician' => [
                        'An inactive technician cannot accept new work.',
                    ],
                ]);
            }

            $lockedJobOrder = $this->lockJobOrder($jobOrder);

            $this->ensureSelectedTechnician(
                $lockedJobOrder,
                $technician
            );

            $this->ensureStatus(
                $lockedJobOrder,
                'pending_technician_response',
                'Only a request awaiting technician response can be accepted.'
            );

            $this->ensureScheduleVersion(
                $lockedJobOrder,
                $scheduleVersion
            );

            $revision = $this->lockCurrentScheduleRevision(
                $lockedJobOrder
            );

            $this->ensureRevisionHasNoResponse($revision);

            $conflict = $this->availabilityService->firstConflict(
                $technician,
                $revision->scheduled_at,
                $revision->scheduled_end_at,
                $lockedJobOrder->id,
                true
            );

            if ($conflict !== null) {
                throw ValidationException::withMessages([
                    'scheduled_at' => [
                        "This schedule overlaps with {$conflict->job_order_number}. Reject this schedule or ask the dispatcher to reschedule it.",
                    ],
                ])->status(409);
            }

            $response = JobOrderTechnicianResponse::create([
                'job_order_id' => $lockedJobOrder->id,
                'schedule_revision_id' => $revision->id,
                'technician_id' => $technician->id,
                'responded_by' => $performedBy->id,
                'response' => 'accepted',
                'response_notes' => $remarks,
                'responded_at' => now(),
            ]);

            $lockedJobOrder->update([
                'status' => 'accepted',
            ]);

            $this->recordStatusHistory(
                $lockedJobOrder,
                'pending_technician_response',
                'accepted',
                'technician_accepted',
                $performedBy,
                $remarks ?? 'Technician accepted the schedule.',
                [
                    'schedule_revision_id' => $revision->id,
                    'schedule_version' => $revision->version,
                    'technician_response_id' => $response->id,
                ]
            );

            return $lockedJobOrder->fresh();
        });
    }

    public function reject(
        JobOrder $jobOrder,
        User $performedBy,
        int $scheduleVersion,
        string $reason
    ): JobOrder {
        return DB::transaction(function () use (
            $jobOrder,
            $performedBy,
            $scheduleVersion,
            $reason
        ): JobOrder {
            $technician = $this->lockTechnician($performedBy);
            $lockedJobOrder = $this->lockJobOrder($jobOrder);

            $this->ensureSelectedTechnician(
                $lockedJobOrder,
                $technician
            );

            $this->ensureStatus(
                $lockedJobOrder,
                'pending_technician_response',
                'Only a request awaiting technician response can be rejected.'
            );

            $this->ensureScheduleVersion(
                $lockedJobOrder,
                $scheduleVersion
            );

            $revision = $this->lockCurrentScheduleRevision(
                $lockedJobOrder
            );

            $this->ensureRevisionHasNoResponse($revision);

            $response = JobOrderTechnicianResponse::create([
                'job_order_id' => $lockedJobOrder->id,
                'schedule_revision_id' => $revision->id,
                'technician_id' => $technician->id,
                'responded_by' => $performedBy->id,
                'response' => 'rejected',
                'response_notes' => $reason,
                'responded_at' => now(),
            ]);

            $lockedJobOrder->update([
                'status' => 'technician_rejected',
            ]);

            $this->recordStatusHistory(
                $lockedJobOrder,
                'pending_technician_response',
                'technician_rejected',
                'technician_rejected',
                $performedBy,
                $reason,
                [
                    'schedule_revision_id' => $revision->id,
                    'schedule_version' => $revision->version,
                    'technician_response_id' => $response->id,
                ]
            );

            return $lockedJobOrder->fresh();
        });
    }

    public function start(
        JobOrder $jobOrder,
        User $performedBy,
        ?string $remarks
    ): JobOrder {
        return DB::transaction(function () use (
            $jobOrder,
            $performedBy,
            $remarks
        ): JobOrder {
            $technician = $this->lockTechnician($performedBy);
            $lockedJobOrder = $this->lockJobOrder($jobOrder);

            $this->ensureSelectedTechnician(
                $lockedJobOrder,
                $technician
            );

            $this->ensureStatus(
                $lockedJobOrder,
                'accepted',
                'Only accepted work can be started.'
            );

            $lockedJobOrder->update([
                'status' => 'in_progress',
            ]);

            $this->recordStatusHistory(
                $lockedJobOrder,
                'accepted',
                'in_progress',
                'technician_started',
                $performedBy,
                $remarks ?? 'Technician started the work.'
            );

            return $lockedJobOrder->fresh();
        });
    }

    public function complete(
        JobOrder $jobOrder,
        User $performedBy,
        ?string $remarks
    ): JobOrder {
        return DB::transaction(function () use (
            $jobOrder,
            $performedBy,
            $remarks
        ): JobOrder {
            $technician = $this->lockTechnician($performedBy);
            $lockedJobOrder = $this->lockJobOrder($jobOrder);

            $this->ensureSelectedTechnician(
                $lockedJobOrder,
                $technician
            );

            $this->ensureStatus(
                $lockedJobOrder,
                'in_progress',
                'Only work in progress can be completed.'
            );

            $completedAt = now();

            $lockedJobOrder->update([
                'status' => 'completed',
                'completed_at' => $completedAt,
            ]);

            $this->recordStatusHistory(
                $lockedJobOrder,
                'in_progress',
                'completed',
                'technician_completed',
                $performedBy,
                $remarks ?? 'Technician completed the work.',
                [
                    'completed_at' =>
                        $completedAt->toIso8601String(),
                ]
            );

            return $lockedJobOrder->fresh();
        });
    }

    private function lockTechnician(User $user): Technician
    {
        $technician = Technician::query()
            ->where('user_id', $user->id)
            ->lockForUpdate()
            ->first();

        if (! $technician) {
            throw ValidationException::withMessages([
                'technician' => [
                    'No technician profile is linked to this account.',
                ],
            ]);
        }

        return $technician;
    }

    private function lockJobOrder(
        JobOrder $jobOrder
    ): JobOrder {
        return JobOrder::query()
            ->lockForUpdate()
            ->findOrFail($jobOrder->id);
    }

    private function ensureSelectedTechnician(
        JobOrder $jobOrder,
        Technician $technician
    ): void {
        if (
            $jobOrder->selected_technician_id
            !== $technician->id
        ) {
            throw new AuthorizationException(
                'Only the customer-selected technician may perform this action.'
            );
        }
    }

    private function ensureStatus(
        JobOrder $jobOrder,
        string $requiredStatus,
        string $message
    ): void {
        if ($jobOrder->status !== $requiredStatus) {
            throw ValidationException::withMessages([
                'status' => [$message],
            ]);
        }
    }

    private function ensureScheduleVersion(
        JobOrder $jobOrder,
        int $scheduleVersion
    ): void {
        if ($jobOrder->schedule_version !== $scheduleVersion) {
            throw ValidationException::withMessages([
                'schedule_version' => [
                    "The schedule changed. Refresh this request and review schedule version {$jobOrder->schedule_version} before responding.",
                ],
            ])->status(409);
        }
    }

    private function lockCurrentScheduleRevision(
        JobOrder $jobOrder
    ): JobOrderScheduleRevision {
        if (
            $jobOrder->schedule_version < 1
            || $jobOrder->scheduled_at === null
            || $jobOrder->scheduled_end_at === null
        ) {
            throw ValidationException::withMessages([
                'schedule' => [
                    'This request does not have a complete official schedule.',
                ],
            ]);
        }

        $revision = JobOrderScheduleRevision::query()
            ->where('job_order_id', $jobOrder->id)
            ->where('version', $jobOrder->schedule_version)
            ->lockForUpdate()
            ->first();

        if (! $revision) {
            throw ValidationException::withMessages([
                'schedule' => [
                    'The current schedule revision could not be found.',
                ],
            ]);
        }

        return $revision;
    }

    private function ensureRevisionHasNoResponse(
        JobOrderScheduleRevision $revision
    ): void {
        $alreadyResponded = JobOrderTechnicianResponse::query()
            ->where('schedule_revision_id', $revision->id)
            ->exists();

        if ($alreadyResponded) {
            throw ValidationException::withMessages([
                'response' => [
                    'A response has already been recorded for this schedule.',
                ],
            ]);
        }
    }

    /**
     * @param array<string, mixed>|null $metadata
     */
    private function recordStatusHistory(
        JobOrder $jobOrder,
        string $previousStatus,
        string $status,
        string $action,
        User $changedBy,
        string $remarks,
        ?array $metadata = null
    ): void {
        JobOrderStatusHistory::create([
            'job_order_id' => $jobOrder->id,
            'previous_status' => $previousStatus,
            'status' => $status,
            'action' => $action,
            'changed_by' => $changedBy->id,
            'remarks' => $remarks,
            'metadata' => $metadata,
        ]);
    }
}