<?php

namespace App\Policies;

use App\Models\LeadTask;
use App\Models\User;

class LeadTaskPolicy
{
    public function update(User $user, LeadTask $task): bool
    {
        return $user->hasRole('admin') || $task->lead->agent_id === $user->id;
    }

    public function delete(User $user, LeadTask $task): bool
    {
        return $this->update($user, $task);
    }
}
