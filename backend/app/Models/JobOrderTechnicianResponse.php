<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrderTechnicianResponse extends Model
{
    use HasFactory;

    public const RESPONSES = [
        'accepted',
        'rejected',
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'job_order_id',
        'schedule_revision_id',
        'technician_id',
        'responded_by',
        'response',
        'response_notes',
        'responded_at',
    ];

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function scheduleRevision(): BelongsTo
    {
        return $this->belongsTo(
            JobOrderScheduleRevision::class,
            'schedule_revision_id'
        );
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(Technician::class);
    }

    public function respondedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }
}