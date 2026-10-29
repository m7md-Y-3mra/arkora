<?php

use App\Models\LeadTask;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/helpers.php';

test('an agent can add, complete and delete a task on their lead', function () {
    $agent = crmUser('agent');
    $lead = crmLead($agent);

    $this->actingAs($agent)
        ->post(route('dashboard.leads.tasks.store', $lead), ['title' => 'اتصال متابعة', 'due_at' => now()->addDay()->toDateTimeString()])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $task = LeadTask::firstOrFail();
    expect($task->user_id)->toBe($agent->id)->and($task->completed_at)->toBeNull();

    $this->actingAs($agent)->patch(route('dashboard.tasks.toggle', $task))->assertRedirect();
    expect($task->refresh()->completed_at)->not->toBeNull();

    $this->actingAs($agent)->patch(route('dashboard.tasks.toggle', $task))->assertRedirect();
    expect($task->refresh()->completed_at)->toBeNull();

    $this->actingAs($agent)->delete(route('dashboard.tasks.destroy', $task))->assertRedirect();
    expect(LeadTask::count())->toBe(0);
});

test('a task added by an admin belongs to the lead\'s agent', function () {
    $admin = crmUser('admin');
    $agent = crmUser('agent');
    $lead = crmLead($agent);

    $this->actingAs($admin)
        ->post(route('dashboard.leads.tasks.store', $lead), ['title' => 'x', 'due_at' => now()->addDay()->toDateTimeString()])
        ->assertRedirect();

    expect(LeadTask::first()->user_id)->toBe($agent->id);
});

test('an agent cannot toggle or delete another agent\'s task', function () {
    $owner = crmUser('agent');
    $other = crmUser('agent');
    $lead = crmLead($owner);
    $task = LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $owner->id]);

    $this->actingAs($other)->patch(route('dashboard.tasks.toggle', $task))->assertForbidden();
    $this->actingAs($other)->delete(route('dashboard.tasks.destroy', $task))->assertForbidden();
});

test('tasks are bucketed into overdue, today, upcoming and done', function () {
    $this->travelTo(now()->setTime(12, 0));

    $agent = crmUser('agent');
    $other = crmUser('agent');
    $lead = crmLead($agent);
    $otherLead = crmLead($other);

    LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $agent->id, 'due_at' => now()->subHour()]);
    LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $agent->id, 'due_at' => now()->addHours(3)]);
    LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $agent->id, 'due_at' => now()->addDays(2)]);
    LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $agent->id, 'due_at' => now()->subDay(), 'completed_at' => now()]);
    LeadTask::factory()->create(['lead_id' => $otherLead->id, 'user_id' => $other->id, 'due_at' => now()->subHour()]);

    $this->actingAs($agent)
        ->get(route('dashboard.tasks.index', ['bucket' => 'today']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Tasks/Index')
            ->where('bucket', 'today')
            ->where('counts', ['overdue' => 1, 'today' => 1, 'upcoming' => 1, 'done' => 1])
            ->has('tasks.data', 1));

    // Admins see every agent's tasks.
    $this->actingAs(crmUser('admin'))
        ->get(route('dashboard.tasks.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('bucket', 'overdue')
            ->where('counts.overdue', 2));
});
