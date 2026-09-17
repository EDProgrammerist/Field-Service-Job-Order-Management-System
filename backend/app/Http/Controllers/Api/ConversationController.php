<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Conversation\StoreConversationMessageRequest;
use App\Http\Resources\ConversationMessageResource;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\JobOrder;
use App\Services\JobOrderConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Conversation::class);

        $validated = $request->validate([
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $user = $request->user();

        $conversations = Conversation::query()
            ->whereHas(
                'participants',
                fn ($query) =>
                    $query->where('users.id', $user->id)
            )
            ->with($this->relations())
            ->withCount([
                'messages as unread_messages_count' =>
                    fn ($query) =>
                        $query
                            ->where(
                                'sender_id',
                                '!=',
                                $user->id
                            )
                            ->whereNull('read_at'),
            ])
            ->orderByDesc('updated_at')
            ->paginate(
                (int) ($validated['per_page'] ?? 20)
            )
            ->withQueryString();

        $conversations->through(
            fn (Conversation $conversation): array =>
                (new ConversationResource($conversation))
                    ->resolve($request)
        );

        return response()->json([
            'message' =>
                'Conversations retrieved successfully.',
            'data' => $conversations,
        ]);
    }

    public function forJobOrder(
        Request $request,
        JobOrder $jobOrder,
        JobOrderConversationService $service
    ): JsonResponse {
        Gate::authorize('useConversation', $jobOrder);

        $conversation = $service
            ->ensureForJobOrder($jobOrder);

        $this->loadConversation(
            $conversation,
            $request
        );

        return response()->json([
            'message' =>
                'Conversation retrieved successfully.',
            'data' => (
                new ConversationResource($conversation)
            )->resolve($request),
        ]);
    }

    public function show(
        Request $request,
        Conversation $conversation
    ): JsonResponse {
        Gate::authorize('view', $conversation);

        $this->loadConversation(
            $conversation,
            $request
        );

        return response()->json([
            'message' =>
                'Conversation retrieved successfully.',
            'data' => (
                new ConversationResource($conversation)
            )->resolve($request),
        ]);
    }

    public function messages(
        Request $request,
        Conversation $conversation
    ): JsonResponse {
        Gate::authorize('view', $conversation);

        $validated = $request->validate([
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $messages = $conversation
            ->messages()
            ->with('sender:id,name,role')
            ->latest('id')
            ->paginate(
                (int) ($validated['per_page'] ?? 50)
            )
            ->withQueryString();

        $messages->through(
            fn ($message): array =>
                (new ConversationMessageResource($message))
                    ->resolve($request)
        );

        return response()->json([
            'message' => 'Messages retrieved successfully.',
            'data' => $messages,
        ]);
    }

    public function store(
        StoreConversationMessageRequest $request,
        Conversation $conversation,
        JobOrderConversationService $service
    ): JsonResponse {
        Gate::authorize('sendMessage', $conversation);

        $message = $service->sendMessage(
            $conversation,
            $request->user(),
            $request->string('body')->toString()
        );

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => (
                new ConversationMessageResource($message)
            )->resolve($request),
        ], 201);
    }

    public function markRead(
        Request $request,
        Conversation $conversation,
        JobOrderConversationService $service
    ): JsonResponse {
        Gate::authorize('markRead', $conversation);

        $updatedMessages = $service->markRead(
            $conversation,
            $request->user()
        );

        return response()->json([
            'message' => 'Conversation marked as read.',
            'data' => [
                'conversation_id' => $conversation->id,
                'marked_read_count' => $updatedMessages,
            ],
        ]);
    }

    private function loadConversation(
        Conversation $conversation,
        Request $request
    ): void {
        $user = $request->user();

        $conversation->load($this->relations());

        $conversation->loadCount([
            'messages as unread_messages_count' =>
                fn ($query) =>
                    $query
                        ->where(
                            'sender_id',
                            '!=',
                            $user->id
                        )
                        ->whereNull('read_at'),
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function relations(): array
    {
        return [
            'participants:id,name,role',
            'jobOrder.customer:id,name',
            'jobOrder.selectedTechnician.user:id,name',
            'latestMessage.sender:id,name,role',
        ];
    }
}