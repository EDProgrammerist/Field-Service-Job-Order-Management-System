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
    public function index(
        Request $request,
        JobOrder $jobOrder
    ): JsonResponse {
        $pagination = $request->validate([
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $perPage = (int) ($pagination['per_page'] ?? 15);

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