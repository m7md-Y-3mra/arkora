<?php

use App\Models\Contact;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/helpers.php';

test('the contacts list is scoped to the agent', function () {
    $agent = crmUser('agent');
    $other = crmUser('agent');
    crmLead($agent);
    crmLead($agent, ['email' => 'second@example.com']);
    crmLead($other);

    $this->actingAs($agent)
        ->get(route('dashboard.contacts.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Contacts/Index')
            ->has('contacts.data', 2));

    $this->actingAs(crmUser('admin'))
        ->get(route('dashboard.contacts.index'))
        ->assertInertia(fn (Assert $page) => $page->has('contacts.data', 3));
});

test('a contact page groups the person\'s leads and activity', function () {
    $agent = crmUser('agent');
    $first = crmLead($agent);
    crmLead($agent);
    $this->actingAs($agent)->post(route('dashboard.leads.activities.store', $first), ['type' => 'note', 'body' => 'ملاحظة']);

    $contact = Contact::firstOrFail();

    $this->actingAs($agent)
        ->get(route('dashboard.contacts.show', $contact))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Contacts/Show')
            ->has('contact.leads', 2)
            ->has('activities', 1));
});

test('the owner can update a contact and others cannot see or edit it', function () {
    $agent = crmUser('agent');
    $other = crmUser('agent');
    crmLead($agent);
    $contact = Contact::firstOrFail();

    $this->actingAs($agent)
        ->put(route('dashboard.contacts.update', $contact), ['name' => 'اسم جديد', 'phone' => '0509999999', 'notes' => 'يفضل الاتصال مساءً'])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($contact->refresh()->notes)->toBe('يفضل الاتصال مساءً');

    $this->actingAs($other)->get(route('dashboard.contacts.show', $contact))->assertForbidden();
    $this->actingAs($other)->put(route('dashboard.contacts.update', $contact), ['name' => 'x'])->assertForbidden();
});

test('clients cannot reach CRM pages', function () {
    $client = crmUser('client');

    $this->actingAs($client)->get(route('dashboard.contacts.index'))->assertForbidden();
    $this->actingAs($client)->get(route('dashboard.tasks.index'))->assertForbidden();
    $this->actingAs($client)->get(route('dashboard.leads.board'))->assertForbidden();
});
