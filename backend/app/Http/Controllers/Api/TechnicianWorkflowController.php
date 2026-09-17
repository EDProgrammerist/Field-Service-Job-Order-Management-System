<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Technician\RejectJobOrderRequest;
use App\Http\Requests\Technician\TechnicianJobActionRequest;
use App\Http\Resources\TechnicianJobOrderResource;
use App\Models\JobOrder;
use App\Services\TechnicianJobOrderWorkflowService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class TechnicianWorkflowController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $technician = $request->user()->technician;

        if (! $technician) {
            return response()->json([
                'message' =>
                    'No technician profile is linked to this account.',
            ], 422);
        }

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

        $jobOrders = JobOrder::query()
            ->where('selected_technician_id', $technician->id)
            ->with($this->relations())
            ->when(
                isset($validated['status']),
                fn ($query) =>
                    $query->where('status', $validated['status'])
            )
            ->orderByRaw('scheduled_at IS NULL')
            ->orderBy('scheduled_at')
            ->orderByDesc('created_at')
            ->paginate((int) ($validated['per_page'] ?? 15))
            ->withQueryString();

        $jobOrders->through(
            fn (JobOrder $jobOrder): array =>
                (new TechnicianJobOrderResource($jobOrder))
                    ->resolve($request)
        );

        return response()->json([
            'message' => 'Technician job orders retrieved successfully.',
            'data' => $jobOrders,
        ]);
    }

    public function show(
        Request $request,
        JobOrder $jobOrder
    ): JsonResponse {
        Gate::authorize('viewTechnicianWork', $jobOrder);

        $jobOrder->load($this->relations());

        return $this->jobOrderResponse(
            $request,
            $jobOrder,
            'Technician job order retrieved successfully.'
        );
    }

    public function accept(
        TechnicianJobActionRequest $request,
        JobOrder $jobOrder,
        TechnicianJobOrderWorkflowService $service
    ): JsonResponse {
        Gate::authorize('respondToSchedule', $jobOrder);

        $jobOrder = $service->accept(
            $jobOrder,
            $request->user(),
            $request->input('remarks')
        );

        $jobOrder->load($this->relations());

        return $this->jobOrderResponse(
            $request,
            $jobOrder,
            'Schedule accepted successfully.'
        );
    }

    public function reject(
        RejectJobOrderRequest $request,
        JobOrder $jobOrder,
        TechnicianJobOrderWorkflowService $service
    ): JsonResponse {
        Gate::authorize('respondToSchedule', $jobOrder);

        $jobOrder = $service->reject(
            $jobOrder,
            $request->user(),
            $request->string('reason')->toString()
        );

        $jobOrder->load($this->relations());

        return $this->jobOrderResponse(
            $request,
            $jobOrder,
            'Schedule rejected successfully.'
        );
    }

    public function start(
        TechnicianJobActionRequest $request,
        JobOrder $jobOrder,
        TechnicianJobOrderWorkflowService $service
    ): JsonResponse {
        Gate::authorize('startWork', $jobOrder);

        $jobOrder = $service->start(
            $jobOrder,
            $request->user(),
            $request->input('remarks')
        );

        $jobOrder->load($this->relations());

        return $this->jobOrderResponse(
            $request,
            $jobOrder,
            'Work started successfully.'
        );
    }

    public function complete(
        TechnicianJobActionRequest $request,
        JobOrder $jobOrder,
        TechnicianJobOrderWorkflowService $service
    ): JsonResponse {
        Gate::authorize('completeWork', $jobOrder);

        $jobOrder = $service->complete(
            $jobOrder,
            $request->user(),
            $request->input('remarks')
        );

        $jobOrder->load($this->relations());

        return $this->jobOrderResponse(
            $request,
            $jobOrder,
            'Work completed successfully.'
        );
    }

    public function schedule(Request $request): JsonResponse
    {
        $technician = $request->user()->technician;

        if (! $technician) {
            return response()->json([
                'message' =>
                    'No technician profile is linked to this account.',
            ], 422);
        }

        $validated = $request->validate([
            'from' => [
                'nullable',
                'required_with:to',
                'date',
            ],
            'to' => [
                'nullable',
                'required_with:from',
                'date',
                'after:from',
            ],
        ]);

        $from = isset($validated['from'])
            ? CarbonImmutable::parse($validated['from'])->utc()
            : CarbonImmutable::now()->utc()->startOfDay();

        $to = isset($validated['to'])
            ? CarbonImmutable::parse($validated['to'])->utc()
            : $from->addDays(30);

        $jobOrders = JobOrder::query()
            ->where('selected_technician_id', $technician->id)
            ->whereIn(
                'status',
                JobOrder::TECHNICIAN_SCHEDULE_STATUSES
            )
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<', $to)
            ->with($this->relations())
            ->orderBy('scheduled_at')
            ->get()
            ->filter(function (JobOrder $jobOrder) use ($from): bool {
                $end = $jobOrder->scheduled_end_at
                    ?? $jobOrder->scheduled_at->copy()->addHour();

                return $end->greaterThan($from);
            })
            ->values()
            ->map(
                fn (JobOrder $jobOrder): array =>
                    (new TechnicianJobOrderResource($jobOrder))
                        ->resolve($request)
            );

        return response()->json([
            'message' => 'Technician schedule retrieved successfully.',
            'data' => [
                'from' => $from->toIso8601String(),
                'to' => $to->toIso8601String(),
                'job_orders' => $jobOrders,
            ],
        ]);
    }

    public function history(
        JobOrder $jobOrder
    ): JsonResponse {
        Gate::authorize('viewTechnicianWork', $jobOrder);

        $history = $jobOrder
            ->statusHistories()
            ->with('changedBy:id,name,email,role')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Job order history retrieved successfully.',
            'data' => $history,
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function relations(): array
    {
        return [
            'customer:id,name,contact_person,email,phone',
            'selectedTechnician.user:id,name,email,role',
            'latestScheduleRevision.scheduledBy:id,name,email,role',
            'latestTechnicianResponse.respondedBy:id,name,email,role',
        ];
    }

    private function jobOrderResponse(
        Request $request,
        JobOrder $jobOrder,
        string $message
    ): JsonResponse {
        return response()->json([
            'message' => $message,
            'data' => (
                new TechnicianJobOrderResource($jobOrder)
            )->resolve($request),
        ]);
    }
}