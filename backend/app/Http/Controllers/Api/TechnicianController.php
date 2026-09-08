<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Technician\StoreTechnicianRequest;
use App\Http\Requests\Technician\UpdateTechnicianRequest;
use App\Models\Technician;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    /**
     * Display a paginated list of technicians.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        $technicians = Technician::query()
            ->with('user:id,name,email,role')
            ->when(
                $request->has('is_active'),
                fn ($query) => $query->where('is_active', $request->boolean('is_active'))
            )
            ->orderBy('employee_number')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Technicians retrieved successfully.',
            'data' => $technicians,
        ]);
    }

    /**
     * Store a newly created technician profile.
     */
    public function store(StoreTechnicianRequest $request): JsonResponse
    {
        $technician = Technician::create($request->validated());
        $technician->load('user:id,name,email,role');

        return response()->json([
            'message' => 'Technician created successfully.',
            'data' => $technician,
        ], 201);
    }

    /**
     * Display the specified technician.
     */
    public function show(Technician $technician): JsonResponse
    {
        $technician->load('user:id,name,email,role');

        return response()->json([
            'message' => 'Technician retrieved successfully.',
            'data' => $technician,
        ]);
    }

    /**
     * Display the authenticated technician's profile.
     */
    public function me(Request $request): JsonResponse
    {
        $technician = $request->user()
            ->technician()
            ->with('user:id,name,email,role')
            ->first();

        if (! $technician) {
            return response()->json([
                'message' => 'No technician profile exists for this user.',
            ], 404);
        }

        return response()->json([
            'message' => 'Technician profile retrieved successfully.',
            'data' => $technician,
        ]);
    }

    /**
     * Update the specified technician profile.
     */
    public function update(
        UpdateTechnicianRequest $request,
        Technician $technician
    ): JsonResponse {
        $technician->update($request->validated());
        $technician->load('user:id,name,email,role');

        return response()->json([
            'message' => 'Technician updated successfully.',
            'data' => $technician->fresh()->load('user:id,name,email,role'),
        ]);
    }
}