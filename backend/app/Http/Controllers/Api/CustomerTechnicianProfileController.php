<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TechnicianProfileResource;
use App\Models\Technician;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerTechnicianProfileController extends Controller
{
    /**
     * Display active technician profiles for customer selection.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'per_page' => [
                'sometimes',
                'integer',
                'min:3',
                'max:50',
            ],
            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'specialization' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 12);
        $search = trim((string) ($validated['search'] ?? ''));
        $specialization = trim(
            (string) ($validated['specialization'] ?? '')
        );

        $technicians = Technician::query()
            ->active()
            ->with('user:id,name')
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(function (Builder $query) use ($search): void {
                        $query
                            ->where(
                                'employee_number',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'specialization',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhereHas(
                                'user',
                                fn (Builder $userQuery) =>
                                    $userQuery->where(
                                        'name',
                                        'like',
                                        "%{$search}%"
                                    )
                            );
                    });
                }
            )
            ->when(
                $specialization !== '',
                fn (Builder $query) =>
                    $query->where(
                        'specialization',
                        'like',
                        "%{$specialization}%"
                    )
            )
            ->orderBy('employee_number')
            ->paginate($perPage)
            ->withQueryString();

        return TechnicianProfileResource::collection($technicians)
            ->additional([
                'message' => 'Active technician profiles retrieved successfully.',
            ]);
    }

    /**
     * Display one active technician profile.
     */
    public function show(
        Technician $technician
    ): TechnicianProfileResource {
        abort_unless($technician->is_active, 404);

        $technician->load('user:id,name');

        return (new TechnicianProfileResource($technician))
            ->additional([
                'message' => 'Technician profile retrieved successfully.',
            ]);
    }
}