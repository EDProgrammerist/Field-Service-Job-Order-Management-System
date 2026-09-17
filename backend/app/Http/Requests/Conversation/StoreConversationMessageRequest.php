<?php

namespace App\Http\Requests\Conversation;

use App\Models\Conversation;
use Illuminate\Foundation\Http\FormRequest;

class StoreConversationMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $conversation = $this->route('conversation');

        return $conversation instanceof Conversation
            && $this->user()?->can(
                'sendMessage',
                $conversation
            );
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => [
                'required',
                'string',
                'max:5000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'body.required' =>
                'Please enter a message.',
            'body.max' =>
                'Messages cannot exceed 5000 characters.',
        ];
    }
}