<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function view(User $user, Lead $lead): bool
    {
        return $user->hasRole('admin') || $lead->agent_id === $user->id;
    }

    public function update(User $user, Lead $lead): bool
    {
        return $this->view($user, $lead);
    }

    public function assign(User $user, Lead $lead): bool
    {
        return $user->hasRole('admin');
    }
}
