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
            ->with([
                'customer:id,name,contact_person,email,phone',
                'creator:id,name,email,role',
            ])
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

        $jobOrder->load([
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
        ]);

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
        $jobOrder->load([
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
        ]);

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

        $jobOrder->load([
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
        ]);

        return response()->json([
            'message' => 'Job order updated successfully.',
            'data' => $jobOrder->fresh()->load([
                'customer:id,name,contact_person,email,phone',
                'creator:id,name,email,role',
            ]),
        ]);
    }
}