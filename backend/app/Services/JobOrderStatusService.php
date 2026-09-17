<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\JobOrderAssignment;
use App\Models\JobOrderStatusHistory;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JobOrderStatusService
{
    /**
     * Administrative transitions only.
     *
     * Accepting, rejecting, starting, and completing work remain
     * exclusive to the selected technician's dedicated endpoints.
     */
    private const ADMIN_TRANSITIONS = [
        'pending_schedule' => ['cancelled'],
        'pending_technician_response' => ['cancelled'],
        'accepted' => ['cancelled'],
        'technician_rejected' => ['cancelled'],
        'in_progress' => ['cancelled'],
        'completed' => ['closed'],

        /*
         * Temporary support for historical rows. These statuses can only
         * move toward cancellation and cannot re-enter the new workflow.
         */
        'pending_review' => ['cancelled'],
        'created' => ['cancelled'],
        'assigned' => ['cancelled'],

        'closed' => [],
        'cancelled' => [],
    ];

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
        ): JobOrderStatusHistory {
            if ($changedBy->role !== 'admin') {
                throw new AuthorizationException(
                    'Only administrators may use the administrative status endpoint.'
                );
            }

            $lockedJobOrder = JobOrder::query()
                ->lockForUpdate()
                ->findOrFail($jobOrder->id);

            $currentStatus = $lockedJobOrder->status;

            if ($currentStatus === $newStatus) {
                throw ValidationException::withMessages([
                    'status' => [
                        "The request is already {$newStatus}.",
                    ],
                ]);
            }

            if (! in_array(
                $newStatus,
                self::ADMIN_TRANSITIONS[$currentStatus] ?? [],
                true
            )) {
                throw ValidationException::withMessages([
                    'status' => [
                        "An administrator cannot change this request from {$currentStatus} to {$newStatus}.",
                    ],
                ]);
            }

            $updates = [
                'status' => $newStatus,
            ];

            if ($newStatus === 'closed') {
                $updates['closed_at'] = now();
            }

            $lockedJobOrder->update($updates);

            /*
             * Legacy active assignments are ended when an administrator
             * cancels the associated request. The records are retained.
             */
            if ($newStatus === 'cancelled') {
                JobOrderAssignment::query()
                    ->where(
                        'job_order_id',
                        $lockedJobOrder->id
                    )
                    ->whereNull('unassigned_at')
                    ->lockForUpdate()
                    ->update([
                        'unassigned_at' => now(),
                    ]);
            }

            return JobOrderStatusHistory::create([
                'job_order_id' => $lockedJobOrder->id,
                'previous_status' => $currentStatus,
                'status' => $newStatus,
                'action' => $newStatus === 'cancelled'
                    ? 'admin_cancelled'
                    : 'admin_closed',
                'changed_by' => $changedBy->id,
                'remarks' => $remarks ?? (
                    $newStatus === 'cancelled'
                        ? 'Administrator cancelled the request.'
                        : 'Administrator closed the completed request.'
                ),
                'metadata' => [
                    'administrative_action' => true,
                ],
            ]);
        });
    }
}