<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Crm\StoreLeadActivityRequest;
use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Http\RedirectResponse;

class LeadActivityController extends Controller
{
    public function __construct(private LeadRepositoryInterface $leads)
    {
    }

    public function store(StoreLeadActivityRequest $request, Lead $lead): RedirectResponse
    {
        $validated = $request->validated();

        $this->leads->addActivity($lead, $request->user(), $validated['type'], $validated['body']);

        return back()->with('success', 'تمت إضافة النشاط.');
    }
}
