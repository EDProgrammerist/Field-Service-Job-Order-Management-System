<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobOrder\UpdateJobOrderRequest;
use App\Http\Requests\JobOrder\UpdateJobOrderStatusRequest;
use App\Models\JobOrder;
use App\Services\JobOrderStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobOrderController extends Controller
{
    /**
     * Display all requests for administrative oversight.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
            'status' => [
                'sometimes',
                Rule::in(JobOrder::STATUSES),
            ],
            'priority' => [
                'sometimes',
                Rule::in(JobOrder::PRIORITIES),
            ],
            'customer_id' => [
                'sometimes',
                'integer',
                Rule::exists('customers', 'id'),
            ],
        ]);

        $perPage = (int) ($filters['per_page'] ?? 15);

        $jobOrders = JobOrder::query()
            ->with($this->jobOrderRelations())
            ->when(
                array_key_exists('status', $filters),
                fn ($query) =>
                    $query->where(
                        'status',
                        $filters['status']
                    )
            )
            ->when(
                array_key_exists('priority', $filters),
                fn ($query) =>
                    $query->where(
                        'priority',
                        $filters['priority']
                    )
            )
            ->when(
                array_key_exists('customer_id', $filters),
                fn ($query) =>
                    $query->where(
                        'customer_id',
                        $filters['customer_id']
                    )
            )
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' =>
                'Job orders retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    /**
     * Display one request for administrative oversight.
     */
    public function show(
        JobOrder $jobOrder
    ): JsonResponse {
        $jobOrder->load($this->jobOrderRelations());

        return response()->json([
            'message' =>
                'Job order retrieved successfully.',
            'data' => $jobOrder,
        ]);
    }

    /**
     * Update non-workflow request details.
     */
    public function update(
        UpdateJobOrderRequest $request,
        JobOrder $jobOrder
    ): JsonResponse {
        $jobOrder->update($request->validated());

        return response()->json([
            'message' =>
                'Job order updated successfully.',
            'data' => $jobOrder
                ->fresh()
                ->load($this->jobOrderRelations()),
        ]);
    }

    /**
     * Perform an administrative cancellation or closure.
     */
    public function updateStatus(
        UpdateJobOrderStatusRequest $request,
        JobOrder $jobOrder,
        JobOrderStatusService $statusService
    ): JsonResponse {
        $history = $statusService->transition(
            $jobOrder,
            $request->string('status')->toString(),
            $request->user(),
            $request->input('remarks')
        );

        $history->load([
            'changedBy:id,name,email,role',
            'jobOrder.customer:id,name,contact_person,email,phone',
            'jobOrder.creator:id,name,email,role',
            'jobOrder.selectedTechnician.user:id,name,email,role',
            'jobOrder.scheduledBy:id,name,email,role',
            'jobOrder.activeAssignment.technician.user:id,name,email,role',
        ]);

        return response()->json([
            'message' =>
                'Job order status updated successfully.',
            'data' => [
                'job_order' => $history->jobOrder,
                'status_history' => $history,
            ],
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function jobOrderRelations(): array
    {
        return [
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
            'selectedTechnician.user:id,name,email,role',
            'scheduledBy:id,name,email,role',
            'activeAssignment.technician.user:id,name,email,role',
        ];
    }
}