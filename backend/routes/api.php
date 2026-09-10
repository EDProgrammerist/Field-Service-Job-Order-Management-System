<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerServiceRequestController;
use App\Http\Controllers\Api\JobOrderAssignmentController;
use App\Http\Controllers\Api\JobOrderController;
use App\Http\Controllers\Api\JobOrderStatusHistoryController;
use App\Http\Controllers\Api\TechnicianController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/customer/register', [AuthController::class, 'registerCustomer']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:customer')->group(function () {
        Route::get(
            '/customer/service-requests',
            [CustomerServiceRequestController::class, 'index']
        );

        Route::get(
            '/customer/service-requests/{jobOrder}',
            [CustomerServiceRequestController::class, 'show']
        );

        Route::post(
            '/customer/service-requests',
            [CustomerServiceRequestController::class, 'store']
        );
    });

    Route::middleware('role:admin,dispatcher,technician')->patch(
        '/job-orders/{jobOrder}/status',
        [JobOrderController::class, 'updateStatus']
    );

    Route::middleware('role:technician')->group(function () {
        Route::get('/technicians/me', [TechnicianController::class, 'me']);
        Route::get('/my-job-orders', [JobOrderController::class, 'myJobOrders']);
    });

    Route::middleware('role:admin,dispatcher,technician')->group(function () {
        Route::apiResource('customers', CustomerController::class)
            ->only(['index', 'show']);
    });

    Route::middleware('role:admin,dispatcher')->group(function () {
        Route::apiResource('customers', CustomerController::class)
            ->only(['store', 'update', 'destroy']);

        Route::apiResource('technicians', TechnicianController::class)
            ->only(['index', 'show']);

        Route::apiResource('job-orders', JobOrderController::class)
            ->only(['index', 'store', 'show', 'update', 'destroy']);

        Route::get(
            '/job-orders/{jobOrder}/assignments',
            [JobOrderAssignmentController::class, 'index']
        );

        Route::post(
            '/job-orders/{jobOrder}/assignments',
            [JobOrderAssignmentController::class, 'store']
        );

        Route::patch(
            '/job-order-assignments/{jobOrderAssignment}/unassign',
            [JobOrderAssignmentController::class, 'unassign']
        );

        Route::get(
            '/job-orders/{jobOrder}/status-history',
            [JobOrderStatusHistoryController::class, 'index']
        );
    });

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class)
            ->only(['index', 'store', 'show', 'update']);

        Route::apiResource('technicians', TechnicianController::class)
            ->only(['store', 'update']);
    });
});