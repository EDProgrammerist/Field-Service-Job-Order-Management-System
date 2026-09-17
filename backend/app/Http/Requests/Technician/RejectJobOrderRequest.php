<?php

namespace App\Http\Requests\Technician;

use Illuminate\Foundation\Http\FormRequest;

class RejectJobOrderRequest extends FormRequest
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
            'reason' => [
                'required',
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
            'reason.required' =>
                'Please provide a reason for rejecting the schedule.',
        ];
    }
}