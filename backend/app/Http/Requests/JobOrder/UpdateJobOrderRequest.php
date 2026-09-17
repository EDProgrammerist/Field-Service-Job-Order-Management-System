<?php

namespace App\Http\Requests\JobOrder;

use App\Models\JobOrder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],
            'service_address' => [
                'sometimes',
                'required',
                'string',
                'max:2000',
            ],
            'priority' => [
                'sometimes',
                Rule::in(JobOrder::PRIORITIES),
            ],

            /*
             * These fields belong to dedicated workflow actions.
             */
            'customer_id' => ['prohibited'],
            'selected_technician_id' => ['prohibited'],
            'created_by' => ['prohibited'],
            'job_order_number' => ['prohibited'],
            'status' => ['prohibited'],
            'scheduled_at' => ['prohibited'],
            'scheduled_end_at' => ['prohibited'],
            'schedule_version' => ['prohibited'],
            'scheduled_by' => ['prohibited'],
            'completed_at' => ['prohibited'],
            'closed_at' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_id.prohibited' =>
                'The request customer cannot be replaced.',
            'selected_technician_id.prohibited' =>
                'The customer-selected technician cannot be replaced.',
            'status.prohibited' =>
                'Use an authorized workflow action to change status.',
            'scheduled_at.prohibited' =>
                'Only the dispatcher scheduling endpoint can change the schedule.',
            'scheduled_end_at.prohibited' =>
                'Only the dispatcher scheduling endpoint can change the schedule.',
            'schedule_version.prohibited' =>
                'Schedule versions are managed automatically.',
            'scheduled_by.prohibited' =>
                'The scheduling actor is managed automatically.',
            'completed_at.prohibited' =>
                'Completion timestamps are managed automatically.',
            'closed_at.prohibited' =>
                'Closure timestamps are managed automatically.',
        ];
    }
}