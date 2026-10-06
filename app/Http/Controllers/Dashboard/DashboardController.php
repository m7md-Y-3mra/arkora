<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\LeadRepositoryInterface;
use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
        private LeadRepositoryInterface $leads,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $agentId = $user->hasRole('admin') ? null : $user->id;

        return Inertia::render('Dashboard/Overview', [
            'stats' => $this->properties->dashboardStats($agentId),
            'newLeadsCount' => $this->leads->countNew($agentId),
            'recentLeads' => $this->leads->paginateForAgent($agentId, [], 5)->items(),
            'recentProperties' => $this->properties->paginateForDashboard($agentId, [], 5)->items(),
            'leadsTrend' => $this->leads->trendLast14Days($agentId),
            'propertyTypeCounts' => $this->properties->countsByType($agentId),
        ]);
    }
}
