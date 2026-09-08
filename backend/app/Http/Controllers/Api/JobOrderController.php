<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobOrder\StoreJobOrderRequest;
use App\Http\Requests\JobOrder\UpdateJobOrderRequest;
use App\Models\JobOrder;
use App\Services\JobOrderNumberGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobOrderController extends Controller
{
    /**
     * Display a paginated list of job orders.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        $jobOrders = JobOrder::query()
            ->with($this->jobOrderRelations())
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->input('status'))
            )
            ->when(
                $request->filled('priority'),
                fn ($query) => $query->where('priority', $request->input('priority'))
            )
            ->when(
                $request->filled('customer_id'),
                fn ($query) => $query->where('customer_id', $request->integer('customer_id'))
            )
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Job orders retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    /**
     * Display job orders currently assigned to the authenticated technician.
     */
    public function myJobOrders(Request $request): JsonResponse
    {
        $technician = $request->user()->technician;

        if (! $technician) {
            return response()->json([
                'message' => 'No technician profile exists for this user.',
            ], 404);
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        $jobOrders = JobOrder::query()
            ->whereHas('assignments', function ($query) use ($technician) {
                $query->where('technician_id', $technician->id)
                    ->whereNull('unassigned_at');
            })
            ->with($this->jobOrderRelations())
            ->orderByDesc('scheduled_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Assigned job orders retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    /**
     * Store a newly created job order.
     */
    public function store(
        StoreJobOrderRequest $request,
        JobOrderNumberGenerator $jobOrderNumberGenerator
    ): JsonResponse {
        $jobOrder = DB::transaction(function () use ($request, $jobOrderNumberGenerator) {
            return JobOrder::create([
                ...$request->validated(),
                'job_order_number' => $jobOrderNumberGenerator->generate(),
                'created_by' => $request->user()->id,
                'status' => 'created',
            ]);
        });

        $jobOrder->load($this->jobOrderRelations());

        return response()->json([
            'message' => 'Job order created successfully.',
            'data' => $jobOrder,
        ], 201);
    }

    /**
     * Display the specified job order.
     */
    public function show(JobOrder $jobOrder): JsonResponse
    {
        $jobOrder->load($this->jobOrderRelations());

        return response()->json([
            'message' => 'Job order retrieved successfully.',
            'data' => $jobOrder,
        ]);
    }

    /**
     * Update editable job-order details.
     */
    public function update(
        UpdateJobOrderRequest $request,
        JobOrder $jobOrder
    ): JsonResponse {
        $jobOrder->update($request->validated());

        return response()->json([
            'message' => 'Job order updated successfully.',
            'data' => $jobOrder->fresh()->load($this->jobOrderRelations()),
        ]);
    }

    /**
     * Define the relationships returned with job orders.
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