<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\JobOrderStatusHistory;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerServiceRequestService
{
    public function __construct(
        private readonly JobOrderNumberGenerator
            $jobOrderNumberGenerator,
        private readonly JobOrderConversationService
            $conversationService
    ) {
    }

    /**
     * Create a customer repair request with an immutable technician selection.
     *
     * @param array<string, mixed> $data
     */
    public function create(
        Customer $customer,
        User $createdBy,
        array $data
    ): JobOrder {
        return DB::transaction(function () use (
            $customer,
            $createdBy,
            $data
        ): JobOrder {
            $technician = Technician::query()
                ->lockForUpdate()
                ->find($data['selected_technician_id']);

            if (! $technician || ! $technician->is_active) {
                throw ValidationException::withMessages([
                    'selected_technician_id' => [
                        'The selected technician is unavailable or inactive.',
                    ],
                ]);
            }

            $jobOrder = JobOrder::create([
                'job_order_number' =>
                    $this
                        ->jobOrderNumberGenerator
                        ->generate(),
                'customer_id' => $customer->id,
                'selected_technician_id' => $technician->id,
                'created_by' => $createdBy->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'service_address' =>
                    $data['service_address'],
                'priority' => 'normal',
                'status' => 'pending_schedule',
                'schedule_version' => 0,
            ]);

            JobOrderStatusHistory::create([
                'job_order_id' => $jobOrder->id,
                'previous_status' => null,
                'status' => 'pending_schedule',
                'action' => 'customer_submitted',
                'changed_by' => $createdBy->id,
                'remarks' =>
                    'Customer submitted the service request and selected a technician.',
                'metadata' => [
                    'selected_technician_id' =>
                        $technician->id,
                ],
            ]);

            $this->conversationService
                ->ensureForJobOrder($jobOrder);

            return $jobOrder;
        });
    }
}