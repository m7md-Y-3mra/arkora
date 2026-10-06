<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Models\Property;
use App\Models\User;
use App\Repositories\Contracts\AmenityRepositoryInterface;
use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(
        private PropertyRepositoryInterface $properties,
        private AmenityRepositoryInterface $amenities,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $agentId = $user->hasRole('admin') ? null : $user->id;

        $filters = $request->only(['search', 'status', 'purpose', 'type', 'sort_by', 'sort_dir']);

        return Inertia::render('Dashboard/Properties/Index', [
            'properties' => $this->properties->paginateForDashboard($agentId, array_filter($filters), 10),
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Dashboard/Properties/Form', [
            'amenities' => $this->amenities->all(),
            'agents' => $request->user()->hasRole('admin') ? User::role('agent')->get(['id', 'name']) : [],
            'property' => null,
        ]);
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $data['agent_id'] = $user->hasRole('admin') && ! empty($data['agent_id'])
            ? $data['agent_id']
            : $user->id;

        $amenityIds = $data['amenities'] ?? [];
        $images = $request->file('images', []);
        $coverIndex = (int) ($data['cover_index'] ?? 0);
        unset($data['amenities'], $data['images'], $data['cover_index']);

        $property = $this->properties->create($data);
        $this->properties->syncAmenities($property, $amenityIds);

        $storedImages = [];
        foreach ($images as $index => $file) {
            $path = $file->store('properties', 'public');
            $storedImages[] = ['path' => $path, 'is_cover' => $index === $coverIndex];
        }
        $this->properties->syncImages($property, $storedImages);

        return redirect()->route('dashboard.properties.index')->with('success', 'تم إنشاء العقار بنجاح.');
    }

    public function edit(Request $request, Property $property): Response
    {
        $this->authorizeAccess($request, $property);

        $property->load(['images', 'amenities']);

        return Inertia::render('Dashboard/Properties/Form', [
            'amenities' => $this->amenities->all(),
            'agents' => $request->user()->hasRole('admin') ? User::role('agent')->get(['id', 'name']) : [],
            'property' => $property,
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if ($user->hasRole('admin') && ! empty($data['agent_id'])) {
            $property->agent_id = $data['agent_id'];
        }

        $amenityIds = $data['amenities'] ?? [];
        $newImages = $request->file('new_images', []);
        $existingImages = $data['existing_images'] ?? [];
        $coverKey = $data['cover_key'] ?? null;
        unset($data['amenities'], $data['new_images'], $data['existing_images'], $data['cover_key'], $data['agent_id']);

        $this->properties->update($property, $data);
        $this->properties->syncAmenities($property, $amenityIds);

        $keepPaths = collect($existingImages)->keyBy('id');
        foreach ($property->images as $image) {
            if (! $keepPaths->has($image->id)) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            } else {
                $meta = $keepPaths->get($image->id);
                $image->update([
                    'sort_order' => $meta['sort_order'],
                    'is_cover' => $meta['is_cover'] ?? false,
                ]);
            }
        }

        $nextOrder = (int) $property->images()->max('sort_order') + 1;
        $createdNewImages = [];
        foreach ($newImages as $index => $file) {
            $path = $file->store('properties', 'public');
            $createdNewImages[$index] = $property->images()->create([
                'path' => $path,
                'sort_order' => $nextOrder + $index,
                'is_cover' => false,
            ]);
        }

        if ($coverKey && str_starts_with($coverKey, 'existing:')) {
            $coverId = (int) substr($coverKey, strlen('existing:'));
            $property->images()->update(['is_cover' => false]);
            $property->images()->where('id', $coverId)->update(['is_cover' => true]);
        } elseif ($coverKey && str_starts_with($coverKey, 'new:')) {
            $index = (int) substr($coverKey, strlen('new:'));
            if (isset($createdNewImages[$index])) {
                $property->images()->update(['is_cover' => false]);
                $createdNewImages[$index]->update(['is_cover' => true]);
            }
        }

        return redirect()->route('dashboard.properties.index')->with('success', 'تم تحديث العقار بنجاح.');
    }

    public function destroy(Request $request, Property $property): RedirectResponse
    {
        $this->authorizeAccess($request, $property);

        foreach ($property->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $this->properties->delete($property);

        return redirect()->route('dashboard.properties.index')->with('success', 'تم حذف العقار.');
    }

    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:properties,id'],
            'action' => ['required', 'in:publish,archive,delete'],
        ]);

        $user = $request->user();
        $agentId = $user->hasRole('admin') ? null : $user->id;

        match ($validated['action']) {
            'publish' => $this->properties->bulkUpdateStatus($validated['ids'], 'published', $agentId),
            'archive' => $this->properties->bulkUpdateStatus($validated['ids'], 'archived', $agentId),
            'delete' => $this->properties->bulkDelete($validated['ids'], $agentId),
        };

        return back()->with('success', 'تم تنفيذ العملية بنجاح.');
    }

    private function authorizeAccess(Request $request, Property $property): void
    {
        $user = $request->user();
        abort_if(! $user->hasRole('admin') && $property->agent_id !== $user->id, 403);
    }
}
