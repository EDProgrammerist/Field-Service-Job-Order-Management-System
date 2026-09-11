<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * Display a paginated list of customers.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
            'search' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $perPage = (int) ($filters['per_page'] ?? 15);
        $search = $filters['search'] ?? null;

        $customers = Customer::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere(
                            'contact_person',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Customers retrieved successfully.',
            'data' => $customers,
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(
        StoreCustomerRequest $request
    ): JsonResponse {
        $customer = Customer::create($request->validated());

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => $customer,
        ], 201);
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'message' => 'Customer retrieved successfully.',
            'data' => $customer,
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(
        UpdateCustomerRequest $request,
        Customer $customer
    ): JsonResponse {
        $data = $request->validated();

        DB::transaction(function () use ($customer, $data) {
            $customer->update($data);

            if ($customer->user_id === null) {
                return;
            }

            $user = $customer->user;

            if ($user === null) {
                return;
            }

            if (array_key_exists('name', $data)) {
                $user->name = $data['name'];
            }

            if (array_key_exists('email', $data)) {
                $user->email = $data['email'];
            }

            if ($user->isDirty()) {
                $user->save();
            }
        });

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customer->fresh(),
        ]);
    }

    /**
     * Delete the specified customer.
     */
    public function destroy(Customer $customer): JsonResponse
    {
        if ($customer->user_id !== null) {
            return response()->json([
                'message' => 'Customer cannot be deleted while it is linked to a customer login account.',
            ], 409);
        }

        if ($customer->jobOrders()->exists()) {
            return response()->json([
                'message' => 'Customer cannot be deleted because it has related job orders.',
            ], 409);
        }

        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ]);
    }
}