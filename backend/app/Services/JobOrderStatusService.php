<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\JobOrderAssignment;
use App\Models\JobOrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JobOrderStatusService
{
    /**
     * Define valid status transitions.
     */
    private const ALLOWED_TRANSITIONS = [
        'pending_review' => ['created', 'cancelled'],
        'created' => ['assigned', 'cancelled'],
        'assigned' => ['created', 'in_progress', 'cancelled'],
        'in_progress' => ['assigned', 'completed', 'cancelled'],
        'completed' => ['closed'],
        'closed' => [],
        'cancelled' => [],
    ];

    /**
     * Change the status of a job order and record the history.
     */
    public function transition(
        JobOrder $jobOrder,
        string $newStatus,
        User $changedBy,
        ?string $remarks
    ): JobOrderStatusHistory {
        return DB::transaction(function () use (
            $jobOrder,
            $newStatus,
            $changedBy,
            $remarks
        ) {
            $lockedJobOrder = JobOrder::query()
                ->lockForUpdate()
                ->findOrFail($jobOrder->id);

            $currentStatus = $lockedJobOrder->status;

            if ($currentStatus === $newStatus) {
                throw ValidationException::withMessages([
                    'status' => ['The job order already has this status.'],
                ]);
            }

            if (! in_array(
                $newStatus,
                self::ALLOWED_TRANSITIONS[$currentStatus] ?? [],
                true
            )) {
                throw ValidationException::withMessages([
                    'status' => [
                        "The status cannot change from {$currentStatus} to {$newStatus}.",
                    ],
                ]);
            }

            $activeAssignment = JobOrderAssignment::query()
                ->where('job_order_id', $lockedJobOrder->id)
                ->whereNull('unassigned_at')
                ->lockForUpdate()
                ->first();

            $this->ensureUserCanChangeStatus(
                $lockedJobOrder,
                $currentStatus,
                $newStatus,
                $changedBy,
                $activeAssignment
            );

            if ($newStatus === 'assigned' && ! $activeAssignment) {
                throw ValidationException::withMessages([
                    'status' => [
                        'A job order must have an active technician assignment before it can be marked assigned.',
                    ],
                ]);
            }

            if ($newStatus === 'created' && $activeAssignment) {
                throw ValidationException::withMessages([
                    'status' => [
                        'End the active technician assignment before returning the job order to created status.',
                    ],
                ]);
            }

            if ($newStatus === 'cancelled' && $activeAssignment) {
                throw ValidationException::withMessages([
                    'status' => [
                        'End the active technician assignment before cancelling the job order.',
                    ],
                ]);
            }

            $updates = [
                'status' => $newStatus,
            ];

            if ($newStatus === 'completed') {
                $updates['completed_at'] = now();
            }

            if ($newStatus === 'closed') {
                $updates['closed_at'] = now();
            }

            $lockedJobOrder->update($updates);

            return JobOrderStatusHistory::create([
                'job_order_id' => $lockedJobOrder->id,
                'status' => $newStatus,
                'changed_by' => $changedBy->id,
                'remarks' => $remarks,
            ]);
        });
    }

    /**
     * Ensure the authenticated user may perform this status change.
     */
    private function ensureUserCanChangeStatus(
        JobOrder $jobOrder,
        string $currentStatus,
        string $newStatus,
        User $changedBy,
        ?JobOrderAssignment $activeAssignment
    ): void {
        if (in_array($changedBy->role, ['admin', 'dispatcher'], true)) {
            return;
        }

        if ($changedBy->role !== 'technician') {
            throw ValidationException::withMessages([
                'status' => ['You are not allowed to change this job order status.'],
            ]);
        }

        $technician = $changedBy->technician;

        $isAssignedToTechnician = $technician
            && $activeAssignment
            && $activeAssignment->technician_id === $technician->id;

        $technicianTransitionIsAllowed = (
            $currentStatus === 'assigned'
            && $newStatus === 'in_progress'
        ) || (
            $currentStatus === 'in_progress'
            && $newStatus === 'completed'
        );

        if (! $isAssignedToTechnician || ! $technicianTransitionIsAllowed) {
            throw ValidationException::withMessages([
                'status' => [
                    'Technicians may only start or complete their own active job orders.',
                ],
            ]);
        }
    }
}