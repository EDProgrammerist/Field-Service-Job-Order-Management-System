<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\JobOrder
 */
class CustomerServiceRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_order_number' => $this->job_order_number,
            'customer_id' => $this->customer_id,
            'selected_technician_id' =>
                $this->selected_technician_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'description' => $this->description,
            'service_address' => $this->service_address,
            'priority' => $this->priority,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at,
            'scheduled_end_at' => $this->scheduled_end_at,
            'schedule_version' => $this->schedule_version,
            'scheduled_by' => $this->scheduled_by,
            'completed_at' => $this->completed_at,
            'closed_at' => $this->closed_at,
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

            'creator' => $this->whenLoaded(
                'creator',
                fn (): array => [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                    'role' => $this->creator->role,
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

            /*
             * Retained temporarily so the existing React contract does not
             * lose its current field before the frontend migration.
             */
            'active_assignment' => $this->whenLoaded(
                'activeAssignment'
            ),

            'status_histories' => $this->whenLoaded(
                'statusHistories'
            ),
        ];
    }
}