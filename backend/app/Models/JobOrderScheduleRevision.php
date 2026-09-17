<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobOrderScheduleRevision extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'job_order_id',
        'version',
        'scheduled_at',
        'scheduled_end_at',
        'scheduled_by',
        'remarks',
    ];

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function scheduledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scheduled_by');
    }

    public function technicianResponse(): HasOne
    {
        return $this->hasOne(JobOrderTechnicianResponse::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'scheduled_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
        ];
    }
}