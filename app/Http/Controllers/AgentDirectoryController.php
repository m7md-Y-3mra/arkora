<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgentDirectoryController extends Controller
{
    public function __construct(private PropertyRepositoryInterface $properties)
    {
    }

    public function index(): Response
    {
        return Inertia::render('Public/Agents', [
            'agents' => $this->properties->agentsWithListings(),
        ]);
    }

    public function show(Request $request, int $agent): Response
    {
        $agentProfile = $this->properties->findAgentProfile($agent);

        abort_if(! $agentProfile, 404);

        $properties = $this->properties->paginatePublishedByAgent($agent, 9);
        $this->properties->attachFavoriteFlags($properties, $request->user());

        return Inertia::render('Public/AgentProfile', [
            'agent' => $agentProfile,
            'properties' => $properties,
        ]);
    }
}
