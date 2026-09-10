<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerServiceRequest;
use App\Models\JobOrder;
use App\Models\JobOrderStatusHistory;
use App\Services\JobOrderNumberGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CustomerServiceRequestController extends Controller
{
    /**
     * Display a paginated list of service requests for the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(JobOrder::STATUSES)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' => 'Your account is not linked to a customer profile.',
            ], 422);
        }

        $perPage = $validated['per_page'] ?? 15;

        $jobOrders = JobOrder::query()
            ->where('customer_id', $customer->id)
            ->with($this->jobOrderRelations())
            ->when(
                isset($validated['status']),
                fn ($query) => $query->where('status', $validated['status'])
            )
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Service requests retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    /**
     * Display one service request owned by the authenticated customer.
     */
    public function show(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' => 'Your account is not linked to a customer profile.',
            ], 422);
        }

        if ($jobOrder->customer_id !== $customer->id) {
            return response()->json([
                'message' => 'Service request not found.',
            ], 404);
        }

        $jobOrder->load([
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
            'activeAssignment.technician.user:id,name,email,role',
            'statusHistories' => function ($query) {
                $query->with('changedBy:id,name,email,role')
                    ->latest();
            },
        ]);

        return response()->json([
            'message' => 'Service request retrieved successfully.',
            'data' => $jobOrder,
        ]);
    }

    /**
     * Create a repair or service request for the authenticated customer.
     */
    public function store(
        StoreCustomerServiceRequest $request,
        JobOrderNumberGenerator $jobOrderNumberGenerator
    ): JsonResponse {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' => 'Your account is not linked to a customer profile.',
            ], 422);
        }

        $jobOrder = DB::transaction(function () use (
            $request,
            $customer,
            $jobOrderNumberGenerator
        ) {
            $jobOrder = JobOrder::create([
                'job_order_number' => $jobOrderNumberGenerator->generate(),
                'customer_id' => $customer->id,
                'created_by' => $request->user()->id,
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'service_address' => $request->input('service_address'),
                'priority' => 'normal',
                'status' => 'pending_review',
            ]);

            JobOrderStatusHistory::create([
                'job_order_id' => $jobOrder->id,
                'status' => 'pending_review',
                'changed_by' => $request->user()->id,
                'remarks' => 'Customer service request submitted.',
            ]);

            return $jobOrder;
        });

        $jobOrder->load($this->jobOrderRelations());

        return response()->json([
            'message' => 'Service request submitted successfully.',
            'data' => $jobOrder,
        ], 201);
    }

    /**
     * Define relationships returned with a service request.
     *
     * @return array<int, string>
     */
    private function jobOrderRelations(): array
    {
        return [
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
            'activeAssignment.technician.user:id,name,email,role',
        ];
    }
}