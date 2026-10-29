<?php

use App\Models\AgentProfile;
use App\Models\Property;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

function directoryAgent(array $attributes = [], array $profile = [], array $property = ['status' => 'published']): User
{
    Role::firstOrCreate(['name' => 'agent']);

    $agent = User::factory()->create($attributes);
    $agent->assignRole('agent');
    AgentProfile::factory()->create(['user_id' => $agent->id, ...$profile]);

    if ($property) {
        Property::factory()->create(['agent_id' => $agent->id, ...$property]);
    }

    return $agent;
}

function agentIds($response): array
{
    return collect($response->viewData('page')['props']['agents']['data'])->pluck('id')->sort()->values()->all();
}

it('paginates agents twelve per page', function () {
    foreach (range(1, 14) as $i) {
        directoryAgent();
    }

    $this->get(route('agents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Agents')
            ->has('agents.data', 12)
            ->where('agents.total', 14)
            ->where('agents.last_page', 2));

    $this->get(route('agents.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('agents.data', 2));
});

it('excludes inactive agents and agents without published listings', function () {
    $visible = directoryAgent();
    directoryAgent(['is_active' => false]);
    directoryAgent(property: ['status' => 'draft']);
    directoryAgent(property: []);

    expect(agentIds($this->get(route('agents.index'))))->toBe([$visible->id]);
});

it('searches by agent name or agency name, case-insensitively', function () {
    $byName = directoryAgent(['name' => 'Omar Khaled']);
    $byAgency = directoryAgent(['name' => 'Sara Ali'], ['agency_name' => 'Skyline Estates']);
    directoryAgent(['name' => 'Someone Else'], ['agency_name' => 'Other Agency']);

    expect(agentIds($this->get(route('agents.index', ['search' => 'omar']))))->toBe([$byName->id])
        ->and(agentIds($this->get(route('agents.index', ['search' => 'SKYLINE']))))->toBe([$byAgency->id]);
});

it('filters by city using published listings only', function () {
    $riyadh = directoryAgent(property: ['status' => 'published', 'city' => 'الرياض']);
    $draftInRiyadh = directoryAgent(property: ['status' => 'published', 'city' => 'جدة']);
    Property::factory()->create(['agent_id' => $draftInRiyadh->id, 'status' => 'draft', 'city' => 'الرياض']);

    expect(agentIds($this->get(route('agents.index', ['city' => 'الرياض']))))->toBe([$riyadh->id]);
});

it('filters by minimum experience', function () {
    $senior = directoryAgent(profile: ['years_experience' => 12]);
    directoryAgent(profile: ['years_experience' => 2]);

    expect(agentIds($this->get(route('agents.index', ['min_experience' => 10]))))->toBe([$senior->id]);
});

it('sorts by experience and passes filters and cities to the page', function () {
    $junior = directoryAgent(profile: ['years_experience' => 1], property: ['status' => 'published', 'city' => 'الدمام']);
    $senior = directoryAgent(profile: ['years_experience' => 15], property: ['status' => 'published', 'city' => 'الرياض']);

    $this->get(route('agents.index', ['sort' => 'experience']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('agents.data.0.id', $senior->id)
            ->where('agents.data.1.id', $junior->id)
            ->where('filters.sort', 'experience')
            ->where('cities', ['الدمام', 'الرياض']));
});
