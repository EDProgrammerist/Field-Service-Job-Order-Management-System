<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Customer;
use App\Models\JobOrder;
use App\Models\Technician;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_customer_request_creates_conversation(): void
    {
        [$customerUser] = $this->createCustomer();
        $technician = $this->createTechnician();

        Sanctum::actingAs($customerUser);

        $response = $this->postJson(
            '/api/customer/service-requests',
            [
                'selected_technician_id' =>
                    $technician->id,
                'title' => 'Air conditioner repair',
                'description' =>
                    'The unit is no longer cooling.',
                'service_address' =>
                    '123 Test Street',
            ]
        )->assertCreated();

        $jobOrderId = $response->json('data.id');

        $this->assertDatabaseHas('job_orders', [
            'id' => $jobOrderId,
            'status' => 'pending_schedule',
        ]);

        $conversation = Conversation::query()
            ->where('job_order_id', $jobOrderId)
            ->firstOrFail();

        $this->assertDatabaseHas(
            'conversation_participants',
            [
                'conversation_id' => $conversation->id,
                'user_id' => $customerUser->id,
                'participant_role' => 'customer',
            ]
        );

        $this->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['body' => 'The request has just been submitted.']
        )->assertCreated();

        $this->assertDatabaseHas(
            'conversation_participants',
            [
                'conversation_id' => $conversation->id,
                'user_id' => $technician->user_id,
                'participant_role' => 'technician',
            ]
        );
    }

    public function test_customer_and_selected_technician_can_exchange_messages(): void
    {
        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        Sanctum::actingAs($customerUser);

        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )
            ->assertOk()
            ->json('data.id');

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            [
                'body' =>
                    'Please let me know before you arrive.',
            ]
        )
            ->assertCreated()
            ->assertJsonPath(
                'data.body',
                'Please let me know before you arrive.'
            )
            ->assertJsonPath('data.is_mine', true);

        Sanctum::actingAs($technician->user);

        $this->getJson(
            "/api/conversations/{$conversationId}/messages"
        )
            ->assertOk()
            ->assertJsonPath(
                'data.data.0.body',
                'Please let me know before you arrive.'
            );

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            [
                'body' => 'I will message you on arrival.',
            ]
        )
            ->assertCreated()
            ->assertJsonPath(
                'data.body',
                'I will message you on arrival.'
            );

        $this->assertDatabaseCount(
            'conversation_messages',
            2
        );
    }

    public function test_unrelated_users_and_dispatcher_cannot_access_conversation(): void
    {
        [$customerUser, $customer] =
            $this->createCustomer();

        $selectedTechnician =
            $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $selectedTechnician
        );

        Sanctum::actingAs($customerUser);

        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )
            ->assertOk()
            ->json('data.id');

        [$unrelatedCustomerUser] =
            $this->createCustomer();

        Sanctum::actingAs($unrelatedCustomerUser);

        $this->getJson(
            "/api/conversations/{$conversationId}"
        )->assertForbidden();

        $unrelatedTechnician =
            $this->createTechnician();

        Sanctum::actingAs($unrelatedTechnician->user);

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            [
                'body' => 'Unauthorized message.',
            ]
        )->assertForbidden();

        $dispatcher = User::factory()->create([
            'role' => 'dispatcher',
        ]);

        Sanctum::actingAs($dispatcher);

        $this->getJson('/api/conversations')
            ->assertForbidden();
    }

    public function test_mark_read_only_marks_messages_from_other_participant(): void
    {
        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        Sanctum::actingAs($customerUser);

        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )
            ->assertOk()
            ->json('data.id');

        $customerMessageId = $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            [
                'body' => 'Customer message.',
            ]
        )
            ->assertCreated()
            ->json('data.id');

        Sanctum::actingAs($technician->user);

        $technicianMessageId = $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            [
                'body' => 'Technician message.',
            ]
        )
            ->assertCreated()
            ->json('data.id');

        $this->patchJson(
            "/api/conversations/{$conversationId}/read"
        )
            ->assertOk()
            ->assertJsonPath(
                'data.marked_read_count',
                1
            );

        $this->assertDatabaseMissing(
            'conversation_messages',
            [
                'id' => $customerMessageId,
                'read_at' => null,
            ]
        );

        $this->assertDatabaseHas(
            'conversation_messages',
            [
                'id' => $technicianMessageId,
                'read_at' => null,
            ]
        );

        Sanctum::actingAs($customerUser);

        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonPath(
                'data.data.0.unread_messages_count',
                1
            );

        $this->patchJson(
            "/api/conversations/{$conversationId}/read"
        )
            ->assertOk()
            ->assertJsonPath(
                'data.marked_read_count',
                1
            );
    }

    public function test_job_order_has_only_one_conversation(): void
    {
        [$customerUser, $customer] =
            $this->createCustomer();

        $technician = $this->createTechnician();

        $jobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );

        Sanctum::actingAs($customerUser);

        $firstId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )
            ->assertOk()
            ->json('data.id');

        $secondId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )
            ->assertOk()
            ->json('data.id');

        Sanctum::actingAs($technician->user);

        $technicianId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )
            ->assertOk()
            ->json('data.id');

        $this->assertSame($firstId, $secondId);
        $this->assertSame($firstId, $technicianId);

        $this->assertDatabaseCount('conversations', 1);

        $this->assertDatabaseCount(
            'conversation_participants',
            2
        );
    }

    public function test_rejection_pauses_and_rescheduling_resumes_the_same_conversation(): void
    {
        [$customerUser, $customer] = $this->createCustomer();
        $technician = $this->createTechnician();
        $dispatcher = User::factory()->create(['role' => 'dispatcher']);
        $jobOrder = $this->createJobOrder($customerUser, $customer, $technician);

        Sanctum::actingAs($customerUser);

        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )->assertOk()
            ->assertJsonPath('data.messaging_state', 'active')
            ->json('data.id');

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'Please call before arriving.']
        )->assertCreated();

        $start = now()->addDays(3)->startOfHour();
        Sanctum::actingAs($dispatcher);

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $start->toIso8601String(),
                'scheduled_end_at' => $start->copy()->addHour()->toIso8601String(),
            ]
        )->assertOk()->assertJsonPath('data.schedule_version', 1);

        Sanctum::actingAs($technician->user);

        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/reject",
            [
                'schedule_version' => 1,
                'reason' => 'Unavailable at that time.',
            ]
        )->assertOk()->assertJsonPath('data.status', 'technician_rejected');

        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonCount(0, 'data.data');

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'This must be blocked.']
        )->assertStatus(409)
            ->assertJsonPath('code', 'MESSAGING_UNAVAILABLE');

        Sanctum::actingAs($customerUser);

        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonCount(0, 'data.data');

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'This must also be blocked.']
        )->assertStatus(409)
            ->assertJsonPath('code', 'MESSAGING_UNAVAILABLE')
            ->assertJsonPath(
                'message',
                'Messaging is paused until the dispatcher reschedules this request.'
            );

        $this->getJson("/api/conversations/{$conversationId}")
            ->assertOk()
            ->assertJsonPath('data.messaging_state', 'paused')
            ->assertJsonPath('data.can_send_messages', false);

        $this->getJson("/api/conversations/{$conversationId}/messages")
            ->assertOk()
            ->assertJsonPath('data.data.0.body', 'Please call before arriving.');

        $this->getJson('/api/conversations?scope=all')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $conversationId);

        $nextStart = $start->copy()->addDays(2);
        Sanctum::actingAs($dispatcher);

        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $nextStart->toIso8601String(),
                'scheduled_end_at' => $nextStart->copy()->addHour()->toIso8601String(),
            ]
        )->assertOk()
            ->assertJsonPath('data.status', 'pending_technician_response')
            ->assertJsonPath('data.schedule_version', 2);

        Sanctum::actingAs($customerUser);

        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $conversationId)
            ->assertJsonPath('data.data.0.can_send_messages', true);

        Sanctum::actingAs($technician->user);

        $this->getJson('/api/conversations')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $conversationId);

        Sanctum::actingAs($customerUser);

        $this->getJson("/api/job-orders/{$jobOrder->id}/conversation")
            ->assertOk()
            ->assertJsonPath('data.id', $conversationId);

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'The new time works.']
        )->assertCreated();

        $this->assertDatabaseCount('conversations', 1);
        $this->assertDatabaseCount('conversation_messages', 2);
        $this->assertDatabaseCount('conversation_participants', 2);
    }

    public function test_completed_and_closed_work_remains_read_only(): void
    {
        [$customerUser, $customer] = $this->createCustomer();
        $technician = $this->createTechnician();
        $dispatcher = User::factory()->create(['role' => 'dispatcher']);
        $admin = User::factory()->create(['role' => 'admin']);
        $jobOrder = $this->createJobOrder($customerUser, $customer, $technician);

        Sanctum::actingAs($customerUser);
        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )->assertOk()->json('data.id');

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'Original message.']
        )->assertCreated();

        $start = now()->addDays(3)->startOfHour();
        Sanctum::actingAs($dispatcher);
        $this->patchJson(
            "/api/dispatcher/job-orders/{$jobOrder->id}/schedule",
            [
                'scheduled_at' => $start->toIso8601String(),
                'scheduled_end_at' => $start->copy()->addHour()->toIso8601String(),
            ]
        )->assertOk();

        Sanctum::actingAs($technician->user);
        $this->postJson(
            "/api/technician/job-orders/{$jobOrder->id}/accept",
            ['schedule_version' => 1]
        )->assertOk();
        $this->postJson("/api/technician/job-orders/{$jobOrder->id}/start")
            ->assertOk();
        $this->postJson("/api/technician/job-orders/{$jobOrder->id}/complete")
            ->assertOk()->assertJsonPath('data.status', 'completed');

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'After completion.']
        )->assertStatus(409)
            ->assertJsonPath('code', 'MESSAGING_UNAVAILABLE');

        $this->getJson('/api/conversations')
            ->assertOk()->assertJsonCount(0, 'data.data');
        $this->getJson("/api/conversations/{$conversationId}/messages")
            ->assertOk()->assertJsonPath('data.data.0.body', 'Original message.');

        Sanctum::actingAs($admin);
        $this->patchJson(
            "/api/job-orders/{$jobOrder->id}/status",
            ['status' => 'closed']
        )->assertOk()->assertJsonPath('data.job_order.status', 'closed');

        Sanctum::actingAs($customerUser);
        $this->getJson('/api/conversations')
            ->assertOk()->assertJsonCount(0, 'data.data');
        $this->getJson('/api/conversations?scope=all')
            ->assertOk()->assertJsonPath('data.data.0.messaging_state', 'finished');
        $this->getJson("/api/conversations/{$conversationId}/messages")
            ->assertOk()->assertJsonPath('data.data.0.body', 'Original message.');
        $this->patchJson("/api/conversations/{$conversationId}/read")
            ->assertOk();
        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'After closure.']
        )->assertStatus(409)
            ->assertJsonPath('code', 'MESSAGING_UNAVAILABLE');

        $this->assertDatabaseCount('conversation_messages', 1);

        Sanctum::actingAs($admin);
        $this->getJson("/api/conversations/{$conversationId}/messages")
            ->assertForbidden();
        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'Administrator must not join.']
        )->assertForbidden();
    }

    public function test_cancelled_request_keeps_readable_history_but_blocks_sending(): void
    {
        [$customerUser, $customer] = $this->createCustomer();
        $technician = $this->createTechnician();
        $admin = User::factory()->create(['role' => 'admin']);
        $jobOrder = $this->createJobOrder($customerUser, $customer, $technician);

        Sanctum::actingAs($customerUser);
        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )->assertOk()->json('data.id');
        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'Saved before cancellation.']
        )->assertCreated();

        Sanctum::actingAs($admin);
        $this->patchJson(
            "/api/job-orders/{$jobOrder->id}/status",
            ['status' => 'cancelled']
        )->assertOk();

        foreach ([$customerUser, $technician->user] as $participant) {
            Sanctum::actingAs($participant);
            $this->getJson("/api/conversations/{$conversationId}/messages")
                ->assertOk()
                ->assertJsonPath('data.data.0.body', 'Saved before cancellation.');
            $this->postJson(
                "/api/conversations/{$conversationId}/messages",
                ['body' => 'After cancellation.']
            )->assertStatus(409)
                ->assertJsonPath('code', 'MESSAGING_UNAVAILABLE');
        }

        $this->getJson('/api/conversations')
            ->assertOk()->assertJsonCount(0, 'data.data');
        $this->assertDatabaseCount('conversation_messages', 1);
    }

    public function test_terminal_history_prevents_reopening_and_legacy_statuses_are_read_only(): void
    {
        [$customerUser, $customer] = $this->createCustomer();
        $technician = $this->createTechnician();
        $jobOrder = $this->createJobOrder($customerUser, $customer, $technician);

        Sanctum::actingAs($customerUser);
        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )->assertOk()->json('data.id');

        $jobOrder->statusHistories()->create([
            'previous_status' => 'in_progress',
            'status' => 'completed',
            'action' => 'technician_completed',
            'changed_by' => $technician->user_id,
        ]);

        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'Should stay closed.']
        )->assertStatus(409);

        $this->getJson('/api/conversations')
            ->assertOk()->assertJsonCount(0, 'data.data');

        $jobOrder->update(['status' => 'assigned']);

        $this->getJson("/api/conversations/{$conversationId}")
            ->assertOk()
            ->assertJsonPath('data.messaging_state', 'finished');

        $legacyJobOrder = $this->createJobOrder(
            $customerUser,
            $customer,
            $technician
        );
        $legacyJobOrder->update(['status' => 'assigned']);
        $legacyConversationId = $this->getJson(
            "/api/job-orders/{$legacyJobOrder->id}/conversation"
        )->assertOk()->json('data.id');

        $this->getJson("/api/conversations/{$legacyConversationId}")
            ->assertOk()
            ->assertJsonPath('data.messaging_state', 'read_only');

        $this->postJson(
            "/api/conversations/{$legacyConversationId}/messages",
            ['body' => 'Legacy statuses cannot send.']
        )->assertStatus(409)
            ->assertJsonPath('code', 'MESSAGING_UNAVAILABLE');

        $this->getJson('/api/conversations?scope=all')
            ->assertOk()->assertJsonCount(2, 'data.data');
    }

    public function test_a_stale_participant_cannot_bypass_current_ownership(): void
    {
        [$customerUser, $customer] = $this->createCustomer();
        $technician = $this->createTechnician();
        [$otherCustomerUser] = $this->createCustomer();
        $jobOrder = $this->createJobOrder($customerUser, $customer, $technician);

        Sanctum::actingAs($customerUser);
        $conversationId = $this->getJson(
            "/api/job-orders/{$jobOrder->id}/conversation"
        )->assertOk()->json('data.id');

        Conversation::findOrFail($conversationId)
            ->participants()
            ->attach($otherCustomerUser->id, ['participant_role' => 'customer']);

        Sanctum::actingAs($otherCustomerUser);

        $this->getJson('/api/conversations')
            ->assertOk()->assertJsonCount(0, 'data.data');
        $this->getJson("/api/conversations/{$conversationId}")
            ->assertForbidden();
        $this->getJson("/api/conversations/{$conversationId}/messages")
            ->assertForbidden();
        $this->postJson(
            "/api/conversations/{$conversationId}/messages",
            ['body' => 'Unauthorized.']
        )->assertForbidden();
    }

    /**
     * @return array{0: User, 1: Customer}
     */
    private function createCustomer(): array
    {
        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $customer = $user->customer()->create([
            'name' => $user->name,
            'contact_person' => $user->name,
            'email' => $user->email,
            'phone' => '09170000001',
            'address' => 'Test customer address',
        ]);

        return [$user, $customer];
    }

    private function createTechnician(): Technician
    {
        $user = User::factory()->create([
            'role' => 'technician',
        ]);

        return $user->technician()->create([
            'employee_number' =>
                'TECH-'.Str::upper(Str::random(10)),
            'phone' => '09170000002',
            'specialization' => 'General repair',
            'is_active' => true,
        ]);
    }

    private function createJobOrder(
        User $customerUser,
        Customer $customer,
        Technician $technician
    ): JobOrder {
        return JobOrder::create([
            'job_order_number' =>
                'JO-'.Str::upper(Str::random(14)),
            'customer_id' => $customer->id,
            'selected_technician_id' => $technician->id,
            'created_by' => $customerUser->id,
            'title' => 'Conversation test request',
            'description' => 'Test repair request.',
            'service_address' => 'Test service address',
            'priority' => 'normal',
            'status' => 'pending_schedule',
            'schedule_version' => 0,
        ]);
    }
}
