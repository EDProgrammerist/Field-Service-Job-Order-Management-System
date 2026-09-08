<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobOrderAssignment\StoreJobOrderAssignmentRequest;
use App\Models\JobOrder;
use App\Models\JobOrderAssignment;
use App\Services\JobOrderAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobOrderAssignmentController extends Controller
{
    /**
     * Display assignment history for a job order.
     */
    public function index(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        $assignments = $jobOrder->assignments()
            ->with([
                'technician.user:id,name,email,role',
                'assignedBy:id,name,email,role',
            ])
            ->orderByDesc('assigned_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Job order assignments retrieved successfully.',
            'data' => $assignments,
        ]);
    }

    /**
     * Assign a job order to a technician.
     */
    public function store(
        StoreJobOrderAssignmentRequest $request,
        JobOrder $jobOrder,
        JobOrderAssignmentService $assignmentService
    ): JsonResponse {
        $assignment = $assignmentService->assign(
            $jobOrder,
            $request->integer('technician_id'),
            $request->user()->id,
            $request->input('notes')
        );

        $assignment->load([
            'jobOrder:id,job_order_number,status',
            'technician.user:id,name,email,role',
            'assignedBy:id,name,email,role',
        ]);

        return response()->json([
            'message' => 'Job order assigned successfully.',
            'data' => $assignment,
        ], 201);
    }

    /**
     * End the active assignment.
     */
    public function unassign(
        JobOrderAssignment $jobOrderAssignment,
        JobOrderAssignmentService $assignmentService,
        Request $request
    ): JsonResponse {
        $assignment = $assignmentService->unassign(
            $jobOrderAssignment,
            $request->user()->id
        );

        return response()->json([
            'message' => 'Job order assignment ended successfully.',
            'data' => $assignment->fresh()->load([
                'jobOrder:id,job_order_number,status',
                'technician.user:id,name,email,role',
                'assignedBy:id,name,email,role',
            ]),
        ]);
    }
}