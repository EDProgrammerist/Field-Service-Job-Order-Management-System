<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\JobOrder;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JobOrderConversationService
{
    public function ensureForJobOrder(
        JobOrder $jobOrder
    ): Conversation {
        return DB::transaction(function () use (
            $jobOrder
        ): Conversation {
            $lockedJobOrder = JobOrder::query()
                ->with([
                    'customer:id,user_id',
                    'selectedTechnician:id,user_id',
                ])
                ->lockForUpdate()
                ->findOrFail($jobOrder->id);

            $customerUserId =
                $lockedJobOrder->customer?->user_id;

            $technicianUserId =
                $lockedJobOrder
                    ->selectedTechnician?->user_id;

            if ($customerUserId === null) {
                throw ValidationException::withMessages([
                    'conversation' => [
                        'This request does not have a linked customer account.',
                    ],
                ]);
            }

            if ($technicianUserId === null) {
                throw ValidationException::withMessages([
                    'conversation' => [
                        'This request does not have a selected technician account.',
                    ],
                ]);
            }

            $conversation = Conversation::query()
                ->firstOrCreate([
                    'job_order_id' => $lockedJobOrder->id,
                ]);

            $conversation
                ->participants()
                ->syncWithoutDetaching([
                    $customerUserId => [
                        'participant_role' => 'customer',
                    ],
                    $technicianUserId => [
                        'participant_role' => 'technician',
                    ],
                ]);

            return $conversation->fresh();
        });
    }

    public function sendMessage(
        Conversation $conversation,
        User $sender,
        string $body
    ): ConversationMessage {
        return DB::transaction(function () use (
            $conversation,
            $sender,
            $body
        ): ConversationMessage {
            $lockedConversation = Conversation::query()
                ->lockForUpdate()
                ->findOrFail($conversation->id);

            $this->ensureParticipant(
                $lockedConversation,
                $sender
            );

            $message = $lockedConversation
                ->messages()
                ->create([
                    'sender_id' => $sender->id,
                    'body' => $body,
                ]);

            $lockedConversation
                ->participants()
                ->updateExistingPivot(
                    $sender->id,
                    [
                        'last_read_at' => now(),
                    ]
                );

            $lockedConversation->touch();

            return $message->load(
                'sender:id,name,role'
            );
        });
    }

    public function markRead(
        Conversation $conversation,
        User $reader
    ): int {
        return DB::transaction(function () use (
            $conversation,
            $reader
        ): int {
            $lockedConversation = Conversation::query()
                ->lockForUpdate()
                ->findOrFail($conversation->id);

            $this->ensureParticipant(
                $lockedConversation,
                $reader
            );

            $readAt = now();

            $updatedMessages = $lockedConversation
                ->messages()
                ->where('sender_id', '!=', $reader->id)
                ->whereNull('read_at')
                ->update([
                    'read_at' => $readAt,
                    'updated_at' => $readAt,
                ]);

            $lockedConversation
                ->participants()
                ->updateExistingPivot(
                    $reader->id,
                    [
                        'last_read_at' => $readAt,
                    ]
                );

            return $updatedMessages;
        });
    }

    private function ensureParticipant(
        Conversation $conversation,
        User $user
    ): void {
        $isParticipant = $conversation
            ->participants()
            ->where('users.id', $user->id)
            ->exists();

        if (! $isParticipant) {
            throw new AuthorizationException(
                'Only conversation participants may perform this action.'
            );
        }
    }
}