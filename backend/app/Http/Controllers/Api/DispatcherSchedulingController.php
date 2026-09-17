<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispatcher\ScheduleJobOrderRequest;
use App\Http\Resources\DispatcherJobOrderResource;
use App\Models\JobOrder;
use App\Models\Technician;
use App\Services\JobOrderSchedulingService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class DispatcherSchedulingController extends Controller
{
    /**
     * Display the dispatcher scheduling queue.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewSchedulingQueue', JobOrder::class);

        $validated = $request->validate([
            'status' => [
                'nullable',
                Rule::in(JobOrder::SCHEDULING_STATUSES),
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 15);

        $jobOrders = JobOrder::query()
            ->with($this->relations())
            ->when(
                isset($validated['status']),
                fn ($query) =>
                    $query->where('status', $validated['status']),
                fn ($query) =>
                    $query->whereIn(
                        'status',
                        JobOrder::NEEDS_SCHEDULING_STATUSES
                    )
            )
            ->orderBy('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $jobOrders->through(
            fn (JobOrder $jobOrder): array =>
                (new DispatcherJobOrderResource($jobOrder))
                    ->resolve($request)
        );

        return response()->json([
            'message' => 'Scheduling queue retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    /**
     * Display one scheduling request.
     */
    public function show(
        Request $request,
        JobOrder $jobOrder
    ): JsonResponse {
        Gate::authorize('viewScheduling', $jobOrder);

        $jobOrder->load($this->relations());

        return response()->json([
            'message' => 'Scheduling request retrieved successfully.',
            'data' => (
                new DispatcherJobOrderResource($jobOrder)
            )->resolve($request),
        ]);
    }

    /**
     * Assign or update the official schedule.
     */
    public function schedule(
        ScheduleJobOrderRequest $request,
        JobOrder $jobOrder,
        JobOrderSchedulingService $schedulingService
    ): JsonResponse {
        Gate::authorize('schedule', $jobOrder);

        $jobOrder = $schedulingService->schedule(
            $jobOrder,
            $request->user(),
            $request->validated()
        );

        $jobOrder->load($this->relations());

        return response()->json([
            'message' => 'Official schedule saved successfully.',
            'data' => (
                new DispatcherJobOrderResource($jobOrder)
            )->resolve($request),
        ]);
    }

    /**
     * Show blocking work for a technician within a requested period.
     */
    public function availability(
        Request $request,
        Technician $technician
    ): JsonResponse {
        $validated = $request->validate([
            'from' => [
                'required',
                'date',
            ],
            'to' => [
                'required',
                'date',
                'after:from',
            ],
        ]);

        $from = CarbonImmutable::parse($validated['from'])->utc();
        $to = CarbonImmutable::parse($validated['to'])->utc();

        $candidates = JobOrder::query()
            ->where('selected_technician_id', $technician->id)
            ->whereIn(
                'status',
                JobOrder::BLOCKING_SCHEDULE_STATUSES
            )
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<', $to)
            ->orderBy('scheduled_at')
            ->get();

        $conflicts = $candidates
            ->filter(function (JobOrder $jobOrder) use ($from): bool {
                $end = $jobOrder->scheduled_end_at
                    ?? $jobOrder->scheduled_at
                        ->copy()
                        ->addHour();

                return $end->greaterThan($from);
            })
            ->values()
            ->map(function (JobOrder $jobOrder): array {
                $end = $jobOrder->scheduled_end_at
                    ?? $jobOrder->scheduled_at
                        ->copy()
                        ->addHour();

                return [
                    'id' => $jobOrder->id,
                    'job_order_number' =>
                        $jobOrder->job_order_number,
                    'title' => $jobOrder->title,
                    'status' => $jobOrder->status,
                    'scheduled_at' =>
                        $jobOrder->scheduled_at
                            ->toIso8601String(),
                    'scheduled_end_at' =>
                        $end->toIso8601String(),
                ];
            });

        return response()->json([
            'message' => 'Technician availability retrieved successfully.',
            'data' => [
                'technician_id' => $technician->id,
                'is_active' => $technician->is_active,
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
                'is_available' => $technician->is_active
                    && $conflicts->isEmpty(),
                'conflicts' => $conflicts,
            ],
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function relations(): array
    {
        return [
            'customer:id,name,contact_person,email,phone',
            'creator:id,name,email,role',
            'selectedTechnician.user:id,name',
            'scheduledBy:id,name,email,role',
            'latestScheduleRevision.scheduledBy:id,name,email,role',
        ];
    }
}