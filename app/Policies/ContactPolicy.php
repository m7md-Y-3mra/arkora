<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;

class ContactPolicy
{
    public function view(User $user, Contact $contact): bool
    {
        return $user->hasRole('admin') || $contact->agent_id === $user->id;
    }

    public function update(User $user, Contact $contact): bool
    {
        return $this->view($user, $contact);
    }
}
