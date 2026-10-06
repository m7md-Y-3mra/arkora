<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\PropertyRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(private PropertyRepositoryInterface $properties)
    {
    }

    public function show(string $slug): Response
    {
        $property = $this->properties->findPublishedBySlug($slug);

        abort_if(! $property, 404);

        $this->properties->incrementViews($property);

        return Inertia::render('Public/PropertyDetails', [
            'property' => $property,
        ]);
    }
}
