<?php

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Spatie\Permission\Models\Role;

function crmUser(string $role): User
{
    Role::firstOrCreate(['name' => $role]);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

function crmLead(User $agent, array $attributes = []): Lead
{
    $property = Property::factory()->create(['agent_id' => $agent->id, 'status' => 'published']);

    return app(\App\Repositories\Contracts\LeadRepositoryInterface::class)->create([
        'property_id' => $property->id,
        'agent_id' => $agent->id,
        'name' => 'عميل تجريبي',
        'email' => 'client@example.com',
        'phone' => '0500000000',
        'message' => 'مهتم بالعقار',
        ...$attributes,
    ]);
}
