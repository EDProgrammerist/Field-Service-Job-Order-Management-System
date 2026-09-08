<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobOrderStatusHistoryController extends Controller
{
    /**
     * Display paginated status history for a job order.
     */
    public function index(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        $history = $jobOrder->statusHistories()
            ->with('changedBy:id,name,email,role')
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Job order status history retrieved successfully.',
            'data' => $history,
        ]);
    }
}