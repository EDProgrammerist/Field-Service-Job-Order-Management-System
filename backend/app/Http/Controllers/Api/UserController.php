<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a paginated list of users.
     */
    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderBy('name')
            ->paginate(15);

        return response()->json([
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'message' => 'User retrieved successfully.',
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(
        UpdateUserRequest $request,
        User $user
    ): JsonResponse {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $roleIsChanging = isset($data['role'])
            && $data['role'] !== $user->role;

        if (
            $roleIsChanging
            && (
                $user->technician()->exists()
                || $user->customer()->exists()
            )
        ) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'role' => [
                        'The role cannot be changed because this account has an associated customer or technician profile.',
                    ],
                ],
            ], 422);
        }

        if ($roleIsChanging && $user->role === 'admin') {
            $anotherAdminExists = User::query()
                ->where('role', 'admin')
                ->where('id', '!=', $user->id)
                ->exists();

            if (! $anotherAdminExists) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'role' => [
                            'The role of the last administrator cannot be changed.',
                        ],
                    ],
                ], 422);
            }
        }

        DB::transaction(function () use ($user, $data) {
            $user->update($data);

            $customer = $user->customer;

            if ($customer === null) {
                return;
            }

            $customerData = [];

            if (array_key_exists('name', $data)) {
                $customerData['name'] = $data['name'];
            }

            if (array_key_exists('email', $data)) {
                $customerData['email'] = $data['email'];
            }

            if ($customerData !== []) {
                $customer->update($customerData);
            }
        });

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $user->fresh(),
        ]);
    }
}