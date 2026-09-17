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