<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\JobOrderAssignment;
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

            if (! in_array($lockedJobOrder->status, ['created', 'assigned'], true)) {
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
            }

            return $assignment;
        });
    }

    /**
     * End an active job-order assignment.
     */
    public function unassign(JobOrderAssignment $assignment): JobOrderAssignment
    {
        return DB::transaction(function () use ($assignment) {
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

            $lockedAssignment->update([
                'unassigned_at' => now(),
            ]);

            $hasActiveAssignment = JobOrderAssignment::query()
                ->where('job_order_id', $jobOrder->id)
                ->whereNull('unassigned_at')
                ->exists();

            if (! $hasActiveAssignment && $jobOrder->status === 'assigned') {
                $jobOrder->update([
                    'status' => 'created',
                ]);
            }

            return $lockedAssignment;
        });
    }
}