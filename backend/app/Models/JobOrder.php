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

    public const STATUSES = [
        'created',
        'assigned',
        'in_progress',
        'completed',
        'closed',
        'cancelled',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'job_order_number',
        'customer_id',
        'created_by',
        'title',
        'description',
        'service_address',
        'priority',
        'status',
        'scheduled_at',
        'completed_at',
        'closed_at',
    ];

    /**
     * Get the customer that owns this job order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who created this job order.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get every assignment ever made for this job order.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(JobOrderAssignment::class);
    }

    /**
     * Get the currently active technician assignment.
     */
    public function activeAssignment(): HasOne
    {
        return $this->hasOne(JobOrderAssignment::class)
            ->whereNull('unassigned_at')
            ->latestOfMany();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}