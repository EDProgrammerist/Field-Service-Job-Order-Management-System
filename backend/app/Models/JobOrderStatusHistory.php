<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrderStatusHistory extends Model
{
    use HasFactory;

    /**
     * The database table used by this model.
     */
    protected $table = 'job_order_status_history';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'job_order_id',
        'status',
        'changed_by',
        'remarks',
    ];

    /**
     * Get the job order associated with this status change.
     */
    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class);
    }

    /**
     * Get the user who made this status change.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}