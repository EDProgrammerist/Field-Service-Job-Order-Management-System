<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the technician profile associated with this user.
     */
    public function technician(): HasOne
    {
        return $this->hasOne(Technician::class);
    }

    /**
     * Get the customer profile associated with this user.
     */
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    /**
     * Get the job orders created by this user.
     */
    public function createdJobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class, 'created_by');
    }

    /**
     * Get job-order assignments made by this user.
     */
    public function assignedJobOrderAssignments(): HasMany
    {
        return $this->hasMany(JobOrderAssignment::class, 'assigned_by');
    }

    /**
     * Get job orders scheduled by this user.
     */
    public function scheduledJobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class, 'scheduled_by');
    }

    /**
     * Get schedule revisions created by this user.
     */
    public function jobOrderScheduleRevisions(): HasMany
    {
        return $this->hasMany(
            JobOrderScheduleRevision::class,
            'scheduled_by'
        );
    }

    /**
     * Get technician responses performed by this user.
     */
    public function performedTechnicianResponses(): HasMany
    {
        return $this->hasMany(
            JobOrderTechnicianResponse::class,
            'responded_by'
        );
    }

    /**
     * Get job-order status changes made by this user.
     */
    public function jobOrderStatusChanges(): HasMany
    {
        return $this->hasMany(JobOrderStatusHistory::class, 'changed_by');
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(
            Conversation::class,
            'conversation_participants'
        )
            ->withPivot([
                'participant_role',
                'last_read_at',
            ])
            ->withTimestamps();
    }

    public function sentConversationMessages(): HasMany
    {
        return $this->hasMany(
            ConversationMessage::class,
            'sender_id'
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
