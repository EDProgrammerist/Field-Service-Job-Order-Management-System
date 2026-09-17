<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobOrder extends Model
{
    use HasFactory;

    public const PRIORITIES = [
        'low',
        'normal',
        'high',
        'urgent',
    ];

    /**
     * Statuses shown as active work on a technician's schedule.
     */
    public const TECHNICIAN_SCHEDULE_STATUSES = [
        'accepted',
        'in_progress',
    ];

    /**
     * Statuses visible in the dispatcher scheduling workspace.
     */
    public const SCHEDULING_STATUSES = [
        'pending_schedule',
        'pending_technician_response',
        'technician_rejected',
    ];

    /**
     * Requests which currently require a new official schedule.
     */
    public const NEEDS_SCHEDULING_STATUSES = [
        'pending_schedule',
        'technician_rejected',
    ];

    /**
     * Statuses that reserve a technician's schedule.
     *
     * "assigned" is retained temporarily for legacy records.
     */
    public const BLOCKING_SCHEDULE_STATUSES = [
        'accepted',
        'in_progress',
        'assigned',
    ];

    /**
     * Legacy statuses remain active until Phase 3 changes the workflow.
     */
    public const STATUSES = [
        'pending_schedule',
        'pending_technician_response',
        'accepted',
        'technician_rejected',
        'in_progress',
        'completed',
        'closed',
        'cancelled',

        // Temporary legacy values retained until compatibility cleanup.
        'pending_review',
        'created',
        'assigned',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'job_order_number',
        'customer_id',
        'selected_technician_id',
        'created_by',
        'title',
        'description',
        'service_address',
        'priority',
        'status',
        'scheduled_at',
        'scheduled_end_at',
        'schedule_version',
        'scheduled_by',
        'completed_at',
        'closed_at',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function selectedTechnician(): BelongsTo
    {
        return $this->belongsTo(
            Technician::class,
            'selected_technician_id'
        );
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scheduledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scheduled_by');
    }

    /**
     * Legacy assignment history retained during migration.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(JobOrderAssignment::class);
    }

    /**
     * Legacy active assignment retained for frontend compatibility.
     */
    public function activeAssignment(): HasOne
    {
        return $this->hasOne(JobOrderAssignment::class)
            ->whereNull('unassigned_at')
            ->latestOfMany();
    }

    public function scheduleRevisions(): HasMany
    {
        return $this->hasMany(JobOrderScheduleRevision::class);
    }

    public function latestScheduleRevision(): HasOne
    {
        return $this->hasOne(JobOrderScheduleRevision::class)
            ->latestOfMany('version');
    }

    public function latestTechnicianResponse(): HasOne
    {
        return $this->hasOne(JobOrderTechnicianResponse::class)
            ->latestOfMany();
    }

    public function technicianResponses(): HasMany
    {
        return $this->hasMany(JobOrderTechnicianResponse::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(JobOrderStatusHistory::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
            'schedule_version' => 'integer',
            'completed_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
