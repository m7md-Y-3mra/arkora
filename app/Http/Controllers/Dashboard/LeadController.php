<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function __construct(private LeadRepositoryInterface $leads)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $agentId = $user->hasRole('admin') ? null : $user->id;

        $filters = $request->only(['search', 'status']);

        return Inertia::render('Dashboard/Leads/Index', [
            'leads' => $this->leads->paginateForAgent($agentId, array_filter($filters), 15),
            'filters' => $filters,
        ]);
    }

    public function updateStatus(Request $request, Lead $lead): RedirectResponse
    {
        $user = $request->user();
        abort_if(! $user->hasRole('admin') && $lead->agent_id !== $user->id, 403);

        $validated = $request->validate([
            'status' => ['required', 'in:new,contacted,closed'],
        ]);

        $this->leads->updateStatus($lead, $validated['status']);

        return back()->with('success', 'تم تحديث حالة الرسالة.');
    }
}
