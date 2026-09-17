<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerServiceRequestController;
use App\Http\Controllers\Api\CustomerTechnicianProfileController;
use App\Http\Controllers\Api\DispatcherSchedulingController;
use App\Http\Controllers\Api\JobOrderAssignmentController;
use App\Http\Controllers\Api\JobOrderController;
use App\Http\Controllers\Api\JobOrderStatusHistoryController;
use App\Http\Controllers\Api\TechnicianController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TechnicianWorkflowController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/customer/register', [AuthController::class, 'registerCustomer']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:customer')->group(function () {
        Route::get(
            '/customer/technicians',
            [CustomerTechnicianProfileController::class, 'index']
        );

        Route::get(
            '/customer/technicians/{technician}',
            [CustomerTechnicianProfileController::class, 'show']
        );

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

    Route::middleware('role:dispatcher')->group(function () {
        Route::get(
            '/dispatcher/job-orders',
            [DispatcherSchedulingController::class, 'index']
        );

        Route::get(
            '/dispatcher/job-orders/{jobOrder}',
            [DispatcherSchedulingController::class, 'show']
        );

        Route::patch(
            '/dispatcher/job-orders/{jobOrder}/schedule',
            [DispatcherSchedulingController::class, 'schedule']
        );

        Route::get(
            '/dispatcher/technicians/{technician}/availability',
            [DispatcherSchedulingController::class, 'availability']
        );
    });

    /*
     * Dispatcher is intentionally excluded from arbitrary status changes.
     * The technician route remains temporarily for legacy compatibility
     * until Phase 5 introduces dedicated actions.
     */
    Route::middleware('role:admin')->patch(
        '/job-orders/{jobOrder}/status',
        [JobOrderController::class, 'updateStatus']
    );

    Route::middleware('role:technician')->group(function () {
        Route::get(
            '/technicians/me',
            [TechnicianController::class, 'me']
        );

        Route::get(
            '/technician/job-orders',
            [TechnicianWorkflowController::class, 'index']
        );

        /*
     * Temporary alias for the existing React frontend.
     */
        Route::get(
            '/my-job-orders',
            [TechnicianWorkflowController::class, 'index']
        );

        Route::get(
            '/technician/schedule',
            [TechnicianWorkflowController::class, 'schedule']
        );

        Route::get(
            '/technician/job-orders/{jobOrder}',
            [TechnicianWorkflowController::class, 'show']
        );

        Route::get(
            '/technician/job-orders/{jobOrder}/status-history',
            [TechnicianWorkflowController::class, 'history']
        );

        Route::post(
            '/technician/job-orders/{jobOrder}/accept',
            [TechnicianWorkflowController::class, 'accept']
        );

        Route::post(
            '/technician/job-orders/{jobOrder}/reject',
            [TechnicianWorkflowController::class, 'reject']
        );

        Route::post(
            '/technician/job-orders/{jobOrder}/start',
            [TechnicianWorkflowController::class, 'start']
        );

        Route::post(
            '/technician/job-orders/{jobOrder}/complete',
            [TechnicianWorkflowController::class, 'complete']
        );
    });

    Route::middleware('role:admin,dispatcher')->group(function () {
        Route::apiResource('customers', CustomerController::class)
            ->only(['index', 'show']);

        Route::apiResource('technicians', TechnicianController::class)
            ->only(['index', 'show']);

        Route::get(
            '/job-orders/{jobOrder}/status-history',
            [JobOrderStatusHistoryController::class, 'index']
        );
    });

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class)
            ->only(['index', 'store', 'show', 'update']);

        Route::apiResource('customers', CustomerController::class)
            ->only(['store', 'update', 'destroy']);

        Route::apiResource('technicians', TechnicianController::class)
            ->only(['store', 'update']);

        Route::apiResource('job-orders', JobOrderController::class)
            ->only(['index', 'store', 'show', 'update', 'destroy']);

        /*
         * Legacy assignment endpoints are admin-only during migration.
         * Dispatchers can no longer choose or replace technicians.
         */
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
    });
});
