<?php

namespace App\Policies;

use App\Models\JobOrder;
use App\Models\User;

class JobOrderPolicy
{
    public function viewSchedulingQueue(User $user): bool
    {
        return $user->role === 'dispatcher';
    }

    public function viewScheduling(
        User $user,
        JobOrder $jobOrder
    ): bool {
        return $user->role === 'dispatcher'
            && in_array(
                $jobOrder->status,
                JobOrder::SCHEDULING_STATUSES,
                true
            );
    }

    public function schedule(
        User $user,
        JobOrder $jobOrder
    ): bool {
        return $user->role === 'dispatcher';
    }

    public function viewTechnicianWork(
        User $user,
        JobOrder $jobOrder
    ): bool {
        return $this->isSelectedTechnician($user, $jobOrder);
    }

    public function respondToSchedule(
        User $user,
        JobOrder $jobOrder
    ): bool {
        return $this->isSelectedTechnician($user, $jobOrder);
    }

    public function startWork(
        User $user,
        JobOrder $jobOrder
    ): bool {
        return $this->isSelectedTechnician($user, $jobOrder);
    }

    public function completeWork(
        User $user,
        JobOrder $jobOrder
    ): bool {
        return $this->isSelectedTechnician($user, $jobOrder);
    }

    public function useConversation(
        User $user,
        JobOrder $jobOrder
    ): bool {
        if ($user->role === 'customer') {
            $customerId = $user->customer?->id;

            return $customerId !== null
                && $jobOrder->customer_id === $customerId;
        }

        return $this->isSelectedTechnician(
            $user,
            $jobOrder
        );
    }

    private function isSelectedTechnician(
        User $user,
        JobOrder $jobOrder
    ): bool {
        if ($user->role !== 'technician') {
            return false;
        }

        $technicianId = $user->technician?->id;

        return $technicianId !== null
            && $jobOrder->selected_technician_id === $technicianId;
    }
}
