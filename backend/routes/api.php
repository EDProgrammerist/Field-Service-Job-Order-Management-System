<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerServiceRequestController;
use App\Http\Controllers\Api\CustomerTechnicianProfileController;
use App\Http\Controllers\Api\DispatcherSchedulingController;
use App\Http\Controllers\Api\JobOrderController;
use App\Http\Controllers\Api\JobOrderStatusHistoryController;
use App\Http\Controllers\Api\TechnicianController;
use App\Http\Controllers\Api\TechnicianWorkflowController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::post(
    '/customer/register',
    [AuthController::class, 'registerCustomer']
);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware('role:customer')
        ->group(function (): void {
            Route::get(
                '/customer/technicians',
                [
                    CustomerTechnicianProfileController::class,
                    'index',
                ]
            );

            Route::get(
                '/customer/technicians/{technician}',
                [
                    CustomerTechnicianProfileController::class,
                    'show',
                ]
            );

            Route::get(
                '/customer/service-requests',
                [
                    CustomerServiceRequestController::class,
                    'index',
                ]
            );

            Route::get(
                '/customer/service-requests/{jobOrder}',
                [
                    CustomerServiceRequestController::class,
                    'show',
                ]
            );

            Route::post(
                '/customer/service-requests',
                [
                    CustomerServiceRequestController::class,
                    'store',
                ]
            );
        });

    /*
     * Private request conversations are limited to the customer and
     * the technician selected for that request.
     */
    Route::middleware('role:customer,technician')
        ->group(function (): void {
            Route::get(
                '/conversations',
                [ConversationController::class, 'index']
            );

            Route::get(
                '/job-orders/{jobOrder}/conversation',
                [ConversationController::class, 'forJobOrder']
            );

            Route::get(
                '/conversations/{conversation}',
                [ConversationController::class, 'show']
            );

            Route::get(
                '/conversations/{conversation}/messages',
                [ConversationController::class, 'messages']
            );

            Route::post(
                '/conversations/{conversation}/messages',
                [ConversationController::class, 'store']
            );

            Route::patch(
                '/conversations/{conversation}/read',
                [ConversationController::class, 'markRead']
            );
        });

    Route::middleware('role:dispatcher')
        ->group(function (): void {
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
                [
                    DispatcherSchedulingController::class,
                    'schedule',
                ]
            );

            Route::get(
                '/dispatcher/technicians/{technician}/availability',
                [
                    DispatcherSchedulingController::class,
                    'availability',
                ]
            );
        });

    Route::middleware('role:technician')
        ->group(function (): void {
            Route::get(
                '/technicians/me',
                [TechnicianController::class, 'me']
            );

            Route::get(
                '/technician/job-orders',
                [TechnicianWorkflowController::class, 'index']
            );

            /*
             * Temporary read alias for the existing React frontend.
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

    Route::middleware('role:admin,dispatcher')
        ->group(function (): void {
            Route::apiResource(
                'customers',
                CustomerController::class
            )->only([
                'index',
                'show',
            ]);

            Route::apiResource(
                'technicians',
                TechnicianController::class
            )->only([
                'index',
                'show',
            ]);

            Route::get(
                '/job-orders/{jobOrder}/status-history',
                [
                    JobOrderStatusHistoryController::class,
                    'index',
                ]
            );
        });

    /*
     * Administrative status actions are limited to cancellation and
     * closing completed work.
     */
    Route::middleware('role:admin')->patch(
        '/job-orders/{jobOrder}/status',
        [JobOrderController::class, 'updateStatus']
    );

    Route::middleware('role:admin')
        ->group(function (): void {
            Route::apiResource(
                'users',
                UserController::class
            )->only([
                'index',
                'store',
                'show',
                'update',
            ]);

            Route::apiResource(
                'customers',
                CustomerController::class
            )->only([
                'store',
                'update',
                'destroy',
            ]);

            Route::apiResource(
                'technicians',
                TechnicianController::class
            )->only([
                'store',
                'update',
            ]);

            /*
             * Creation, deletion, assignments, and schedule changes are
             * intentionally excluded from generic administration routes.
             */
            Route::apiResource(
                'job-orders',
                JobOrderController::class
            )->only([
                'index',
                'show',
                'update',
            ]);
        });
});