<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class ConversationPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array(
            $user->role,
            ['customer', 'technician'],
            true
        );
    }

    public function view(
        User $user,
        Conversation $conversation
    ): bool {
        return $this->isParticipant(
            $user,
            $conversation
        );
    }

    public function sendMessage(
        User $user,
        Conversation $conversation
    ): bool {
        return $this->isParticipant(
            $user,
            $conversation
        );
    }

    public function markRead(
        User $user,
        Conversation $conversation
    ): bool {
        return $this->isParticipant(
            $user,
            $conversation
        );
    }

    private function isParticipant(
        User $user,
        Conversation $conversation
    ): bool {
        if (
            ! in_array(
                $user->role,
                ['customer', 'technician'],
                true
            )
        ) {
            return false;
        }

        $jobOrder = $conversation->jobOrder;

        if (
            ! $jobOrder
            || ! Gate::forUser($user)->allows('useConversation', $jobOrder)
        ) {
            return false;
        }

        return $conversation
            ->participants()
            ->where('users.id', $user->id)
            ->exists();
    }
}
