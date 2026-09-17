<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerServiceRequest;
use App\Http\Resources\CustomerServiceRequestResource;
use App\Models\JobOrder;
use App\Services\CustomerServiceRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerServiceRequestController extends Controller
{
    /**
     * Display requests owned by the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => [
                'nullable',
                Rule::in(JobOrder::STATUSES),
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' =>
                    'Your account is not linked to a customer profile.',
            ], 422);
        }

        $perPage = (int) ($validated['per_page'] ?? 15);

        $jobOrders = JobOrder::query()
            ->where('customer_id', $customer->id)
            ->with($this->jobOrderRelations())
            ->when(
                isset($validated['status']),
                fn ($query) =>
                    $query->where('status', $validated['status'])
            )
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        /*
         * Transform paginator items while retaining the existing response:
         * data.data contains the paginated request records.
         */
        $jobOrders->through(
            fn (JobOrder $jobOrder): array =>
                (new CustomerServiceRequestResource($jobOrder))
                    ->resolve($request)
        );

        return response()->json([
            'message' => 'Service requests retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    /**
     * Display one request owned by the authenticated customer.
     */
    public function show(
        Request $request,
        JobOrder $jobOrder
    ): JsonResponse {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' =>
                    'Your account is not linked to a customer profile.',
            ], 422);
        }

        if ($jobOrder->customer_id !== $customer->id) {
            return response()->json([
                'message' => 'Service request not found.',
            ], 404);
        }

        $jobOrder->load([
            ...$this->jobOrderRelations(),
            'statusHistories' => function ($query): void {
                $query
                    ->with('changedBy:id,name,email,role')
                    ->latest();
            },
        ]);

        return response()->json([
            'message' => 'Service request retrieved successfully.',
            'data' => (
                new CustomerServiceRequestResource($jobOrder)
            )->resolve($request),
        ]);
    }

    /**
     * Create a customer request with a selected active technician.
     */
    public function store(
        StoreCustomerServiceRequest $request,
        CustomerServiceRequestService $service
    ): JsonResponse {
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json([
                'message' =>
                    'Your account is not linked to a customer profile.',
            ], 422);
        }

        $jobOrder = $service->create(
            $customer,
            $request->user(),
            $request->validated()
        );

        $jobOrder->load($this->jobOrderRelations());

        return response()->json([
            'message' => 'Service request submitted successfully.',
            'data' => (
                new CustomerServiceRequestResource($jobOrder)
            )->resolve($request),
        ], 201);
    }

    /**
     * @return array<int, string>
     */
    private function jobOrderRelations(): array
    {
        return [
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
            'selectedTechnician.user:id,name',
            'scheduledBy:id,name,email,role',
            'activeAssignment.technician.user:id,name,email,role',
        ];
    }
}