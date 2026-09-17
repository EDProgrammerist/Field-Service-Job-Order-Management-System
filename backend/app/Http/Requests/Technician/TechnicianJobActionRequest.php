<?php

namespace App\Http\Requests\Technician;

use Illuminate\Foundation\Http\FormRequest;

class TechnicianJobActionRequest extends FormRequest
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
            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}