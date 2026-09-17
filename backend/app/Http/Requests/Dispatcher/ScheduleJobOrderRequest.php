<?php

namespace App\Http\Requests\Dispatcher;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleJobOrderRequest extends FormRequest
{
    /**
     * Only dispatchers may assign or update official schedules.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'dispatcher';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'scheduled_at' => [
                'required',
                'date',
                'after:now',
            ],
            'scheduled_end_at' => [
                'required',
                'date',
                'after:scheduled_at',
            ],
            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'scheduled_at.after' =>
                'The scheduled start must be in the future.',
            'scheduled_end_at.after' =>
                'The scheduled end must be after the scheduled start.',
        ];
    }
}