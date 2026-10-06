<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\AmenityRepositoryInterface;
use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertySearchController extends Controller
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
        private AmenityRepositoryInterface $amenities,
    ) {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only([
            'search', 'purpose', 'type', 'city', 'district',
            'min_price', 'max_price', 'min_area', 'max_area',
            'bedrooms', 'bathrooms', 'amenities', 'sort',
        ]);

        return Inertia::render('Public/Search', [
            'properties' => $this->properties->paginatePublished(array_filter($filters), 12),
            'filters' => $filters,
            'amenities' => $this->amenities->all(),
        ]);
    }
}
