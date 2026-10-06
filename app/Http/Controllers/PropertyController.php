<?php

namespace App\Http\Controllers;

use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(private PropertyRepositoryInterface $properties)
    {
    }

    public function show(Request $request, string $slug): Response
    {
        $property = $this->properties->findPublishedBySlug($slug);

        abort_if(! $property, 404);

        $this->properties->incrementViews($property);
        $this->properties->attachFavoriteFlags([$property], $request->user());

        return Inertia::render('Public/PropertyDetails', [
            'property' => $property,
        ]);
    }
}
