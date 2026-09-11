<?php

namespace App\Http\Requests\Customer;

use App\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine whether the user is authorized.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules for the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $customer = $this->route('customer');

        $linkedUserId = $customer instanceof Customer
            ? $customer->user_id
            : null;

        $emailRules = ['sometimes'];

        if ($linkedUserId !== null) {
            $emailRules[] = 'required';
        } else {
            $emailRules[] = 'nullable';
        }

        $emailRules[] = 'email';
        $emailRules[] = 'max:255';

        if ($linkedUserId !== null) {
            $emailRules[] = Rule::unique('users', 'email')
                ->ignore($linkedUserId);
        }

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'contact_person' => [
                'nullable',
                'string',
                'max:255',
            ],
            'email' => $emailRules,
            'phone' => [
                'sometimes',
                'required',
                'string',
                'max:30',
            ],
            'address' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }
}