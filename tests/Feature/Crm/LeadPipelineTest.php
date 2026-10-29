<?php

use App\Enums\LeadStage;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\LeadTask;
use App\Models\Property;
use App\Notifications\NewLeadReceived;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/helpers.php';

beforeEach(function () {
    Notification::fake();
});

test('public lead submission creates a contact and reuses it case-insensitively', function () {
    $agent = crmUser('agent');
    $property = Property::factory()->create(['agent_id' => $agent->id, 'status' => 'published']);

    $payload = ['name' => 'علي', 'phone' => '0501111111', 'message' => 'مرحبا'];

    $this->post(route('properties.leads.store', $property), [...$payload, 'email' => 'Ali@Example.com'])->assertRedirect();
    $this->post(route('properties.leads.store', $property), [...$payload, 'email' => 'ali@example.com'])->assertRedirect();

    expect(Contact::count())->toBe(1)
        ->and(Contact::first()->email)->toBe('ali@example.com')
        ->and(Lead::whereNotNull('contact_id')->count())->toBe(2);
});

test('the same email writing to two agents gives each agent their own contact', function () {
    $first = crmUser('agent');
    $second = crmUser('agent');

    crmLead($first);
    crmLead($second);

    expect(Contact::where('email', 'client@example.com')->count())->toBe(2);
});

test('changing the stage logs a stage_change activity', function () {
    $agent = crmUser('agent');
    $lead = crmLead($agent);

    $this->actingAs($agent)
        ->patch(route('dashboard.leads.update-status', $lead), ['status' => 'viewing'])
        ->assertRedirect();

    $lead->refresh();
    $activity = $lead->activities()->first();

    expect($lead->status)->toBe(LeadStage::Viewing)
        ->and($activity->type)->toBe('stage_change')
        ->and($activity->meta)->toBe(['from' => 'new', 'to' => 'viewing'])
        ->and($activity->user_id)->toBe($agent->id);
});

test('an invalid stage is rejected', function () {
    $agent = crmUser('agent');
    $lead = crmLead($agent);

    $this->actingAs($agent)
        ->patch(route('dashboard.leads.update-status', $lead), ['status' => 'closed'])
        ->assertSessionHasErrors('status');
});

test('an agent cannot touch another agent\'s lead', function () {
    $owner = crmUser('agent');
    $other = crmUser('agent');
    $lead = crmLead($owner);

    $this->actingAs($other)->get(route('dashboard.leads.show', $lead))->assertForbidden();
    $this->actingAs($other)->patch(route('dashboard.leads.update-status', $lead), ['status' => 'won'])->assertForbidden();
    $this->actingAs($other)->post(route('dashboard.leads.activities.store', $lead), ['type' => 'note', 'body' => 'x'])->assertForbidden();
    $this->actingAs($other)->post(route('dashboard.leads.tasks.store', $lead), ['title' => 'x', 'due_at' => now()->addDay()])->assertForbidden();
});

test('the owner sees the lead detail page with its timeline and tasks', function () {
    $agent = crmUser('agent');
    $lead = crmLead($agent);

    $this->actingAs($agent)
        ->post(route('dashboard.leads.activities.store', $lead), ['type' => 'call', 'body' => 'اتصلت بالعميل'])
        ->assertRedirect();

    $this->actingAs($agent)
        ->get(route('dashboard.leads.show', $lead))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Leads/Show')
            ->where('lead.id', $lead->id)
            ->where('lead.activities.0.type', 'call')
            ->where('canAssign', false)
            ->where('agents', []));
});

test('an admin can reassign a lead and its open tasks follow', function () {
    $admin = crmUser('admin');
    $from = crmUser('agent');
    $to = crmUser('agent');
    $lead = crmLead($from);
    $previousContactId = $lead->contact_id;

    $open = LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $from->id]);
    $done = LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $from->id, 'completed_at' => now()]);

    $this->actingAs($admin)
        ->patch(route('dashboard.leads.assign', $lead), ['agent_id' => $to->id])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $lead->refresh();

    expect($lead->agent_id)->toBe($to->id)
        ->and($lead->contact->agent_id)->toBe($to->id)
        ->and($open->refresh()->user_id)->toBe($to->id)
        ->and($done->refresh()->user_id)->toBe($from->id)
        ->and($lead->activities()->first()->type)->toBe('assignment')
        ->and(Contact::find($previousContactId))->toBeNull();

    Notification::assertSentTo($to, NewLeadReceived::class);
});

test('reassigning keeps the previous agent\'s contact when it still has leads or notes', function () {
    $admin = crmUser('admin');
    $from = crmUser('agent');
    $to = crmUser('agent');
    $moved = crmLead($from);
    crmLead($from);

    $this->actingAs($admin)->patch(route('dashboard.leads.assign', $moved), ['agent_id' => $to->id]);

    expect(Contact::where('agent_id', $from->id)->first()->leads()->count())->toBe(1);

    $noted = crmLead($from, ['email' => 'noted@example.com']);
    $noted->contact->update(['notes' => 'عميل مهم']);
    $this->actingAs($admin)->patch(route('dashboard.leads.assign', $noted), ['agent_id' => $to->id]);

    expect(Contact::where('agent_id', $from->id)->where('email', 'noted@example.com')->exists())->toBeTrue();
});

test('only agents can be assigned and only admins can assign', function () {
    $admin = crmUser('admin');
    $agent = crmUser('agent');
    $client = crmUser('client');
    $lead = crmLead($agent);

    $this->actingAs($admin)
        ->patch(route('dashboard.leads.assign', $lead), ['agent_id' => $client->id])
        ->assertSessionHasErrors('agent_id');

    $this->actingAs($agent)
        ->patch(route('dashboard.leads.assign', $lead), ['agent_id' => $agent->id])
        ->assertForbidden();
});

test('the board shows open leads and recently closed ones', function () {
    $agent = crmUser('agent');
    $open = crmLead($agent, ['email' => 'a@example.com']);
    $recentWon = crmLead($agent, ['email' => 'b@example.com', 'status' => 'won']);
    $oldLost = crmLead($agent, ['email' => 'c@example.com', 'status' => 'lost']);
    Lead::whereKey($oldLost->id)->update(['updated_at' => now()->subDays(45)]);

    $this->actingAs($agent)
        ->get(route('dashboard.leads.board'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Leads/Board')
            ->has('leads', 2));
});

test('conversion rate is null without closed leads and computed otherwise', function () {
    $agent = crmUser('agent');
    $repo = app(\App\Repositories\Contracts\LeadRepositoryInterface::class);

    crmLead($agent, ['email' => 'a@example.com']);
    expect($repo->conversionRate($agent->id))->toBeNull();

    crmLead($agent, ['email' => 'b@example.com', 'status' => 'won']);
    crmLead($agent, ['email' => 'c@example.com', 'status' => 'lost']);
    crmLead($agent, ['email' => 'd@example.com', 'status' => 'lost']);
    crmLead($agent, ['email' => 'e@example.com', 'status' => 'lost']);

    expect($repo->conversionRate($agent->id))->toBe(25.0);
});

test('the overview exposes CRM widgets', function () {
    $agent = crmUser('agent');
    $lead = crmLead($agent);
    LeadTask::factory()->create(['lead_id' => $lead->id, 'user_id' => $agent->id, 'due_at' => now()->subDay()]);

    $this->actingAs($agent)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Overview')
            ->has('pipelineCounts', 6)
            ->where('pipelineCounts.0', ['stage' => 'new', 'count' => 1])
            ->where('conversionRate', null)
            ->where('overdueTasksCount', 1)
            ->has('upcomingTasks', 1));
});
