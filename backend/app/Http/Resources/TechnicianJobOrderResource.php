<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\JobOrder
 */
class TechnicianJobOrderResource extends JsonResource
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
            'completed_at' => $this->completed_at,
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
                    ]
                    : null
            ),

            'latest_technician_response' => $this->whenLoaded(
                'latestTechnicianResponse',
                fn (): ?array => $this->latestTechnicianResponse
                    ? [
                        'id' =>
                            $this->latestTechnicianResponse->id,
                        'response' =>
                            $this->latestTechnicianResponse
                                ->response,
                        'response_notes' =>
                            $this->latestTechnicianResponse
                                ->response_notes,
                        'responded_at' =>
                            $this->latestTechnicianResponse
                                ->responded_at,
                    ]
                    : null
            ),

            'allowed_actions' => [
                'accept' =>
                    $this->status ===
                    'pending_technician_response',
                'reject' =>
                    $this->status ===
                    'pending_technician_response',
                'start' => $this->status === 'accepted',
                'complete' => $this->status === 'in_progress',
            ],
        ];
    }
}