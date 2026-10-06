<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    public function __construct(private PropertyRepositoryInterface $properties)
    {
    }

    public function index(Request $request): Response
    {
        $properties = $this->properties->paginateFavorites($request->user(), 12);

        foreach ($properties as $property) {
            $property->setAttribute('is_favorited', true);
        }

        return Inertia::render('Favorites/Index', [
            'properties' => $properties,
        ]);
    }

    public function toggle(Request $request, Property $property): RedirectResponse
    {
        $isFavorited = $this->properties->toggleFavorite($request->user(), $property);

        return back()->with('success', $isFavorited ? 'تم إضافة العقار إلى المحفوظات.' : 'تم إزالة العقار من المحفوظات.');
    }
}
