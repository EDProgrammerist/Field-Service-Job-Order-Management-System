<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ConversationMessage
 */
class ConversationMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'read_at' => $this->read_at,
            'is_read' => $this->read_at !== null,
            'is_mine' =>
                $request->user()?->id === $this->sender_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'sender' => $this->whenLoaded(
                'sender',
                fn (): array => [
                    'id' => $this->sender->id,
                    'name' => $this->sender->name,
                    'role' => $this->sender->role,
                ]
            ),
        ];
    }
}