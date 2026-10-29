<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\LeadStage;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\NewLeadReceived;
use App\Repositories\Contracts\LeadRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function __construct(
        private LeadRepositoryInterface $leads,
        private UserRepositoryInterface $users,
    ) {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'contact_id']);

        return Inertia::render('Dashboard/Leads/Index', [
            'leads' => $this->leads->paginateForAgent($this->scopedAgentId($request), array_filter($filters), 15),
            'filters' => $filters,
        ]);
    }

    public function board(Request $request): Response
    {
        $filters = $request->only(['search']);

        return Inertia::render('Dashboard/Leads/Board', [
            'leads' => $this->leads->board($this->scopedAgentId($request), array_filter($filters)),
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, Lead $lead): Response
    {
        Gate::authorize('view', $lead);

        $canAssign = $request->user()->can('assign', $lead);

        return Inertia::render('Dashboard/Leads/Show', [
            'lead' => $this->leads->findForDetail($lead),
            'agents' => $canAssign ? $this->users->activeAgents() : [],
            'canAssign' => $canAssign,
        ]);
    }

    public function updateStatus(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(LeadStage::class)],
        ]);

        $this->leads->updateStatus($lead, LeadStage::from($validated['status']), $request->user());

        return back()->with('success', 'تم تحديث مرحلة العميل.');
    }

    public function assign(Request $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('assign', $lead);

        $validated = $request->validate([
            'agent_id' => ['required', 'integer', Rule::exists('users', 'id')],
        ]);

        $agent = User::findOrFail($validated['agent_id']);
        if (! $agent->hasRole('agent')) {
            return back()->withErrors(['agent_id' => 'المستخدم المختار ليس وكيلاً.']);
        }

        $previousAgentId = $lead->agent_id;
        $lead = $this->leads->assign($lead, $agent, $request->user());

        if ($previousAgentId !== $agent->id) {
            $agent->notify(new NewLeadReceived($lead->load('property')));
        }

        return back()->with('success', 'تم تحويل العميل إلى ' . $agent->name . '.');
    }

    private function scopedAgentId(Request $request): ?int
    {
        $user = $request->user();

        return $user->hasRole('admin') ? null : $user->id;
    }
}
