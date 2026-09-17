<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Conversation
 */
class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_order_id' => $this->job_order_id,
            'unread_messages_count' =>
                (int) ($this->unread_messages_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'job_order' => $this->whenLoaded(
                'jobOrder',
                fn (): array => [
                    'id' => $this->jobOrder->id,
                    'job_order_number' =>
                        $this->jobOrder->job_order_number,
                    'title' => $this->jobOrder->title,
                    'status' => $this->jobOrder->status,
                    'customer' => [
                        'id' =>
                            $this->jobOrder->customer->id,
                        'name' =>
                            $this->jobOrder->customer->name,
                    ],
                    'selected_technician' => [
                        'id' => $this
                            ->jobOrder
                            ->selectedTechnician
                            ->id,
                        'name' => $this
                            ->jobOrder
                            ->selectedTechnician
                            ->user
                            ->name,
                    ],
                ]
            ),

            'participants' => $this->whenLoaded(
                'participants',
                fn () => $this->participants
                    ->map(
                        fn ($participant): array => [
                            'id' => $participant->id,
                            'name' => $participant->name,
                            'role' => $participant->role,
                            'participant_role' =>
                                $participant
                                    ->pivot
                                    ->participant_role,
                            'last_read_at' =>
                                $participant
                                    ->pivot
                                    ->last_read_at,
                        ]
                    )
                    ->values()
            ),

            'latest_message' => $this->whenLoaded(
                'latestMessage',
                fn () => $this->latestMessage
                    ? new ConversationMessageResource(
                        $this->latestMessage
                    )
                    : null
            ),
        ];
    }
}