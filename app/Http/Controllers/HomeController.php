<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\PropertyRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(private PropertyRepositoryInterface $properties)
    {
    }

    public function index(): Response
    {
        return Inertia::render('Public/Home', [
            'featuredProperties' => $this->properties->featured(6),
        ]);
    }
}
