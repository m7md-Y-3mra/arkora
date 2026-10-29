<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\UpdateContactRequest;
use App\Models\Contact;
use App\Repositories\Contracts\ContactRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(private ContactRepositoryInterface $contacts)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $agentId = $user->hasRole('admin') ? null : $user->id;

        $filters = $request->only(['search']);

        return Inertia::render('Dashboard/Contacts/Index', [
            'contacts' => $this->contacts->paginateForAgent($agentId, array_filter($filters)),
            'filters' => $filters,
        ]);
    }

    public function show(Contact $contact): Response
    {
        Gate::authorize('view', $contact);

        return Inertia::render('Dashboard/Contacts/Show', [
            'contact' => $this->contacts->findForDetail($contact),
            'activities' => $this->contacts->recentActivities($contact),
        ]);
    }

    public function update(UpdateContactRequest $request, Contact $contact): RedirectResponse
    {
        $this->contacts->update($contact, $request->validated());

        return back()->with('success', 'تم تحديث بيانات جهة الاتصال.');
    }
}
