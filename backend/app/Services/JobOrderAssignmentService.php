<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\JobOrderAssignment;
use App\Models\JobOrderStatusHistory;
use App\Models\Technician;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JobOrderAssignmentService
{
    /**
     * Assign a job order to an active technician.
     */
    public function assign(
        JobOrder $jobOrder,
        int $technicianId,
        int $assignedBy,
        ?string $notes
    ): JobOrderAssignment {
        return DB::transaction(function () use (
            $jobOrder,
            $technicianId,
            $assignedBy,
            $notes
        ) {
            $lockedJobOrder = JobOrder::query()
                ->lockForUpdate()
                ->findOrFail($jobOrder->id);

            if (! in_array(
                $lockedJobOrder->status,
                ['created', 'assigned'],
                true
            )) {
                throw ValidationException::withMessages([
                    'job_order' => [
                        'Only job orders with created or assigned status can be assigned.',
                    ],
                ]);
            }

            $technicianExists = Technician::query()
                ->whereKey($technicianId)
                ->where('is_active', true)
                ->exists();

            if (! $technicianExists) {
                throw ValidationException::withMessages([
                    'technician_id' => [
                        'The selected technician is not active.',
                    ],
                ]);
            }

            $activeAssignment = JobOrderAssignment::query()
                ->where('job_order_id', $lockedJobOrder->id)
                ->whereNull('unassigned_at')
                ->lockForUpdate()
                ->first();

            if ($activeAssignment?->technician_id === $technicianId) {
                throw ValidationException::withMessages([
                    'technician_id' => [
                        'This technician is already assigned to the job order.',
                    ],
                ]);
            }

            if ($activeAssignment) {
                $activeAssignment->update([
                    'unassigned_at' => now(),
                ]);
            }

            $assignment = JobOrderAssignment::create([
                'job_order_id' => $lockedJobOrder->id,
                'technician_id' => $technicianId,
                'assigned_by' => $assignedBy,
                'assigned_at' => now(),
                'notes' => $notes,
            ]);

            if ($lockedJobOrder->status === 'created') {
                $lockedJobOrder->update([
                    'status' => 'assigned',
                ]);

                JobOrderStatusHistory::create([
                    'job_order_id' => $lockedJobOrder->id,
                    'status' => 'assigned',
                    'changed_by' => $assignedBy,
                    'remarks' => 'Technician assigned.',
                ]);
            }

            return $assignment;
        });
    }

    /**
     * End an active job-order assignment.
     */
    public function unassign(
        JobOrderAssignment $assignment,
        int $changedBy
    ): JobOrderAssignment {
        return DB::transaction(function () use (
            $assignment,
            $changedBy
        ) {
            $lockedAssignment = JobOrderAssignment::query()
                ->lockForUpdate()
                ->findOrFail($assignment->id);

            if ($lockedAssignment->unassigned_at) {
                throw ValidationException::withMessages([
                    'assignment' => [
                        'This assignment has already been ended.',
                    ],
                ]);
            }

            $jobOrder = JobOrder::query()
                ->lockForUpdate()
                ->findOrFail($lockedAssignment->job_order_id);

            if ($jobOrder->status !== 'assigned') {
                throw ValidationException::withMessages([
                    'assignment' => [
                        'Only an assigned job order can have its assignment ended. Move an in-progress job back to assigned status first.',
                    ],
                ]);
            }

            $lockedAssignment->update([
                'unassigned_at' => now(),
            ]);

            $hasActiveAssignment = JobOrderAssignment::query()
                ->where('job_order_id', $jobOrder->id)
                ->whereNull('unassigned_at')
                ->exists();

            if (! $hasActiveAssignment) {
                $jobOrder->update([
                    'status' => 'created',
                ]);

                JobOrderStatusHistory::create([
                    'job_order_id' => $jobOrder->id,
                    'status' => 'created',
                    'changed_by' => $changedBy,
                    'remarks' => 'Technician assignment ended.',
                ]);
            }

            return $lockedAssignment;
        });
    }
}