<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterCustomerRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a customer account and create its customer profile.
     */
    public function registerCustomer(RegisterCustomerRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'role' => 'customer',
                'password' => Hash::make($request->input('password')),
            ]);

            $user->customer()->create([
                'name' => $request->input('name'),
                'contact_person' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'address' => $request->input('address'),
            ]);

            return $user->load('customer');
        });

        $token = $user->createToken(
            $request->input('device_name', 'customer-portal')
        )->plainTextToken;

        return response()->json([
            'message' => 'Customer registration successful.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Authenticate a user and create an API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $token = $user->createToken(
            $request->input('device_name', 'postman')
        )->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Return the currently authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Authenticated user retrieved successfully.',
            'data' => $request->user(),
        ]);
    }

    /**
     * Revoke the API token used for the current request.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }
}