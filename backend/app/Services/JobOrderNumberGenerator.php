<?php

namespace App\Services;

use App\Models\JobOrder;

class JobOrderNumberGenerator
{
    /**
     * Generate the next readable job-order number for the current date.
     */
    public function generate(): string
    {
        $date = now()->format('Ymd');
        $prefix = "JO-{$date}-";

        $latestNumber = JobOrder::query()
            ->where('job_order_number', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->orderByDesc('id')
            ->value('job_order_number');

        $nextSequence = $latestNumber
            ? (int) substr($latestNumber, strlen($prefix)) + 1
            : 1;

        return $prefix.str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
    }
}