<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerServiceRequest extends FormRequest
{
    /**
     * Only authenticated customers may submit service requests.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'customer';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'selected_technician_id' => [
                'bail',
                'required',
                'integer',
                Rule::exists('technicians', 'id')
                    ->where('is_active', true),
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'required',
                'string',
                'max:5000',
            ],
            'service_address' => [
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
            'selected_technician_id.required' =>
                'Please select your preferred technician.',
            'selected_technician_id.exists' =>
                'The selected technician is unavailable or inactive.',
        ];
    }
}