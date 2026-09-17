<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\Technician;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;
use LogicException;

class TechnicianAvailabilityService
{
    /**
     * Return work that blocks the technician during [from, to).
     *
     * Back-to-back schedules are allowed because the end is exclusive.
     *
     * @return Collection<int, JobOrder>
     */
    public function conflicts(
        Technician|int $technician,
        CarbonInterface $from,
        CarbonInterface $to,
        ?int $exceptJobOrderId = null,
        bool $lockForUpdate = false
    ): Collection {
        if ($to->lessThanOrEqualTo($from)) {
            throw new InvalidArgumentException(
                'The availability end must be after its start.'
            );
        }

        $technicianId = $technician instanceof Technician
            ? $technician->id
            : $technician;

        $query = JobOrder::query()
            ->where('selected_technician_id', $technicianId)
            ->whereIn(
                'status',
                JobOrder::BLOCKING_SCHEDULE_STATUSES
            )
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<', $to)
            ->when(
                $exceptJobOrderId !== null,
                fn ($query) =>
                    $query->where('id', '!=', $exceptJobOrderId)
            )
            ->orderBy('scheduled_at');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        /** @var Collection<int, JobOrder> $candidates */
        $candidates = $query->get();

        return $candidates
            ->filter(
                fn (JobOrder $candidate): bool =>
                    $this->effectiveEnd($candidate)
                        ->greaterThan($from)
            )
            ->values();
    }

    public function firstConflict(
        Technician|int $technician,
        CarbonInterface $from,
        CarbonInterface $to,
        ?int $exceptJobOrderId = null,
        bool $lockForUpdate = false
    ): ?JobOrder {
        return $this->conflicts(
            $technician,
            $from,
            $to,
            $exceptJobOrderId,
            $lockForUpdate
        )->first();
    }

    /**
     * Legacy assigned work might not have scheduled_end_at.
     * Treat such records as one-hour appointments.
     */
    public function effectiveEnd(
        JobOrder $jobOrder
    ): CarbonInterface {
        if ($jobOrder->scheduled_end_at !== null) {
            return $jobOrder->scheduled_end_at;
        }

        if ($jobOrder->scheduled_at === null) {
            throw new LogicException(
                'A scheduled job order must have a start time.'
            );
        }

        return $jobOrder->scheduled_at
            ->copy()
            ->addHour();
    }
}