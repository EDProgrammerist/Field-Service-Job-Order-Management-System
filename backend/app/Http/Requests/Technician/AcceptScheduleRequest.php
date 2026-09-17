<?php

namespace App\Http\Requests\Technician;

use Illuminate\Foundation\Http\FormRequest;

class AcceptScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'technician';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'schedule_version' => [
                'required',
                'integer',
                'min:1',
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
            'schedule_version.required' =>
                'The schedule version is required. Refresh the request before responding.',
        ];
    }
}