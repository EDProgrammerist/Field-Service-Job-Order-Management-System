<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\TechnicianController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:technician')->get(
        '/technicians/me',
        [TechnicianController::class, 'me']
    );

    Route::apiResource('customers', CustomerController::class)
        ->only(['index', 'show']);

    Route::middleware('role:admin,dispatcher')->group(function () {
        Route::apiResource('customers', CustomerController::class)
            ->only(['store', 'update', 'destroy']);

        Route::apiResource('technicians', TechnicianController::class)
            ->only(['index', 'show']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class)
            ->only(['index', 'store', 'show', 'update']);

        Route::apiResource('technicians', TechnicianController::class)
            ->only(['store', 'update']);
    });
});