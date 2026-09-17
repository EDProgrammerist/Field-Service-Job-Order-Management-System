<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin \App\Models\Technician
 */
class TechnicianProfileResource extends JsonResource
{
    /**
     * Transform the resource into a customer-safe profile.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->whenLoaded(
                'user',
                fn (): ?string => $this->user?->name
            ),
            'employee_number' => $this->employee_number,
            'profile_photo_url' => $this->profile_photo_path
                ? Storage::url($this->profile_photo_path)
                : null,
            'introduction' => $this->introduction,
            'specialization' => $this->specialization,
            'qualifications' => $this->qualifications,
            'phone' => $this->phone,
            'availability_notes' => $this->availability_notes,
            'is_active' => (bool) $this->is_active,
        ];
    }
}