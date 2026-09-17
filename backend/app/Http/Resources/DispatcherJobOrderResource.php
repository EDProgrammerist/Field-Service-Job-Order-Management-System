<?php

namespace App\Http\Resources;

use App\Models\JobOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin JobOrder
 */
class DispatcherJobOrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_order_number' => $this->job_order_number,
            'title' => $this->title,
            'description' => $this->description,
            'service_address' => $this->service_address,
            'priority' => $this->priority,
            'status' => $this->status,
            'selected_technician_id' =>
                $this->selected_technician_id,
            'scheduled_at' => $this->scheduled_at,
            'scheduled_end_at' => $this->scheduled_end_at,
            'schedule_version' => $this->schedule_version,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'customer' => $this->whenLoaded(
                'customer',
                fn (): array => [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'contact_person' =>
                        $this->customer->contact_person,
                    'email' => $this->customer->email,
                    'phone' => $this->customer->phone,
                ]
            ),

            'selected_technician' => $this->whenLoaded(
                'selectedTechnician',
                fn () => $this->selectedTechnician
                    ? new TechnicianProfileResource(
                        $this->selectedTechnician
                    )
                    : null
            ),

            'scheduled_by_user' => $this->whenLoaded(
                'scheduledBy',
                fn (): ?array => $this->scheduledBy
                    ? [
                        'id' => $this->scheduledBy->id,
                        'name' => $this->scheduledBy->name,
                    ]
                    : null
            ),

            'latest_schedule_revision' => $this->whenLoaded(
                'latestScheduleRevision',
                fn (): ?array => $this->latestScheduleRevision
                    ? [
                        'id' => $this->latestScheduleRevision->id,
                        'version' =>
                            $this->latestScheduleRevision->version,
                        'scheduled_at' =>
                            $this->latestScheduleRevision->scheduled_at,
                        'scheduled_end_at' =>
                            $this->latestScheduleRevision
                                ->scheduled_end_at,
                        'remarks' =>
                            $this->latestScheduleRevision->remarks,
                        'scheduled_by' => [
                            'id' => $this
                                ->latestScheduleRevision
                                ->scheduledBy
                                ->id,
                            'name' => $this
                                ->latestScheduleRevision
                                ->scheduledBy
                                ->name,
                        ],
                    ]
                    : null
            ),

            'can_schedule' => in_array(
                $this->status,
                JobOrder::SCHEDULING_STATUSES,
                true
            ),
        ];
    }
}