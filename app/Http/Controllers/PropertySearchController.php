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

        if (! empty($filters['amenities']) && is_string($filters['amenities'])) {
            $filters['amenities'] = array_map('intval', explode(',', $filters['amenities']));
        }

        $properties = $this->properties->paginatePublished(array_filter($filters), 12);
        $this->properties->attachFavoriteFlags($properties, $request->user());

        return Inertia::render('Public/Search', [
            'properties' => $properties,
            'filters' => $filters,
            'amenities' => $this->amenities->all(),
        ]);
    }
}
