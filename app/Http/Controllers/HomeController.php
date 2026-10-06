<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(private PropertyRepositoryInterface $properties)
    {
    }

    public function index(Request $request): Response
    {
        $featured = $this->properties->featured(6);
        $this->properties->attachFavoriteFlags($featured, $request->user());

        return Inertia::render('Public/Home', [
            'featuredProperties' => $featured,
        ]);
    }
}
