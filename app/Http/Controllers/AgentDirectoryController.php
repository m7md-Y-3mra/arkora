<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\PropertyRepositoryInterface;
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
}
