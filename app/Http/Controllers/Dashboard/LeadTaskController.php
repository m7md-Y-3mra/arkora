<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\StoreLeadTaskRequest;
use App\Models\Lead;
use App\Models\LeadTask;
use App\Repositories\Contracts\LeadTaskRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LeadTaskController extends Controller
{
    public function __construct(private LeadTaskRepositoryInterface $tasks)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $agentId = $user->hasRole('admin') ? null : $user->id;

        $bucket = $request->query('bucket');
        if (! in_array($bucket, LeadTaskRepositoryInterface::BUCKETS, true)) {
            $bucket = 'overdue';
        }

        return Inertia::render('Dashboard/Tasks/Index', [
            'tasks' => $this->tasks->paginateForAgent($agentId, $bucket),
            'counts' => $this->tasks->bucketCounts($agentId),
            'bucket' => $bucket,
        ]);
    }

    public function store(StoreLeadTaskRequest $request, Lead $lead): RedirectResponse
    {
        $this->tasks->create($lead, $request->validated());

        return back()->with('success', 'تمت إضافة المهمة.');
    }

    public function toggle(LeadTask $task): RedirectResponse
    {
        Gate::authorize('update', $task);

        $this->tasks->toggleComplete($task);

        return back();
    }

    public function destroy(LeadTask $task): RedirectResponse
    {
        Gate::authorize('delete', $task);

        $this->tasks->delete($task);

        return back()->with('success', 'تم حذف المهمة.');
    }
}
