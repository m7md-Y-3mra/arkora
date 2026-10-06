<?php

namespace App\Repositories;

use App\Models\Property;
use App\Models\User;
use App\Repositories\Contracts\PropertyRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class PropertyRepository implements PropertyRepositoryInterface
{
    public function __construct(private Property $model)
    {
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['purpose'] ?? null, fn (Builder $q, $v) => $q->where('purpose', $v))
            ->when($filters['type'] ?? null, fn (Builder $q, $v) => $q->where('type', $v))
            ->when($filters['city'] ?? null, fn (Builder $q, $v) => $q->where('city', $v))
            ->when($filters['district'] ?? null, fn (Builder $q, $v) => $q->where('district', $v))
            ->when($filters['min_price'] ?? null, fn (Builder $q, $v) => $q->where('price', '>=', $v))
            ->when($filters['max_price'] ?? null, fn (Builder $q, $v) => $q->where('price', '<=', $v))
            ->when($filters['min_area'] ?? null, fn (Builder $q, $v) => $q->where('area_sqm', '>=', $v))
            ->when($filters['max_area'] ?? null, fn (Builder $q, $v) => $q->where('area_sqm', '<=', $v))
            ->when($filters['bedrooms'] ?? null, fn (Builder $q, $v) => $q->where('bedrooms', '>=', $v))
            ->when($filters['bathrooms'] ?? null, fn (Builder $q, $v) => $q->where('bathrooms', '>=', $v))
            ->when($filters['amenities'] ?? null, function (Builder $q, $amenityIds) {
                foreach ((array) $amenityIds as $amenityId) {
                    $q->whereHas('amenities', fn (Builder $sub) => $sub->where('amenities.id', $amenityId));
                }
            })
            ->when($filters['search'] ?? null, function (Builder $q, $term) {
                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('title', 'like', "%{$term}%")
                        ->orWhere('city', 'like', "%{$term}%")
                        ->orWhere('district', 'like', "%{$term}%");
                });
            });
    }

    private function applySort(Builder $query, ?string $sort): Builder
    {
        return match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'area_desc' => $query->orderBy('area_sqm', 'desc'),
            'oldest' => $query->orderBy('published_at', 'asc'),
            default => $query->orderBy('published_at', 'desc'),
        };
    }

    public function paginatePublished(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $query = $this->model->query()
            ->where('status', 'published')
            ->with(['images' => fn ($q) => $q->where('is_cover', true), 'agent']);

        $query = $this->applyFilters($query, $filters);
        $query = $this->applySort($query, $filters['sort'] ?? null);

        return $query->paginate($perPage)->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?Property
    {
        return $this->model->query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->with(['images', 'amenities', 'agent.agentProfile'])
            ->first();
    }

    public function findById(int $id): ?Property
    {
        return $this->model->query()->with(['images', 'amenities'])->find($id);
    }

    public function featured(int $limit = 6): Collection
    {
        return $this->model->query()
            ->where('status', 'published')
            ->where('is_featured', true)
            ->with(['images' => fn ($q) => $q->where('is_cover', true), 'agent'])
            ->latest('published_at')
            ->limit($limit)
            ->get();
    }

    public function paginateForDashboard(?int $agentId, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->query()
            ->with(['images' => fn ($q) => $q->where('is_cover', true), 'agent'])
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId));

        $query = $this->applyFilters($query, $filters);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $query->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc');

        return $query->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Property
    {
        $data['slug'] = $this->uniqueSlug($data['title']);

        if (($data['status'] ?? null) === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $this->model->create($data);
    }

    public function update(Property $property, array $data): Property
    {
        if (isset($data['title']) && $data['title'] !== $property->title) {
            $data['slug'] = $this->uniqueSlug($data['title'], $property->id);
        }

        if (($data['status'] ?? null) === 'published' && ! $property->published_at) {
            $data['published_at'] = now();
        }

        $property->update($data);

        return $property->refresh();
    }

    public function delete(Property $property): bool
    {
        return $property->delete();
    }

    public function bulkUpdateStatus(array $ids, string $status, ?int $agentId): int
    {
        return $this->model->query()
            ->whereIn('id', $ids)
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->update(['status' => $status]);
    }

    public function bulkDelete(array $ids, ?int $agentId): int
    {
        $query = $this->model->query()
            ->whereIn('id', $ids)
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId));

        $count = $query->count();
        $query->delete();

        return $count;
    }

    public function incrementViews(Property $property): void
    {
        $property->increment('views_count');
    }

    public function syncAmenities(Property $property, array $amenityIds): void
    {
        $property->amenities()->sync($amenityIds);
    }

    public function syncImages(Property $property, array $images): void
    {
        $property->images()->delete();

        foreach ($images as $index => $image) {
            $property->images()->create([
                'path' => $image['path'],
                'sort_order' => $index,
                'is_cover' => $image['is_cover'] ?? $index === 0,
            ]);
        }
    }

    public function dashboardStats(?int $agentId): array
    {
        $base = $this->model->query()->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId));

        return [
            'total_properties' => (clone $base)->count(),
            'active_listings' => (clone $base)->where('status', 'published')->count(),
            'total_views' => (int) (clone $base)->sum('views_count'),
            'draft_properties' => (clone $base)->where('status', 'draft')->count(),
        ];
    }

    public function countsByType(?int $agentId): array
    {
        return $this->model->query()
            ->selectRaw('type, COUNT(*) as count')
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->groupBy('type')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['type' => $row->type, 'count' => (int) $row->count])
            ->all();
    }

    public function agentsWithListings(): Collection
    {
        return User::query()
            ->role('agent')
            ->where('is_active', true)
            ->whereHas('properties', fn (Builder $q) => $q->where('status', 'published'))
            ->withCount(['properties' => fn (Builder $q) => $q->where('status', 'published')])
            ->with(['agentProfile', 'properties' => fn ($q) => $q->where('status', 'published')->with(['images' => fn ($i) => $i->where('is_cover', true)])->limit(3)])
            ->get();
    }

    public function findAgentProfile(int $agentId): ?User
    {
        return User::query()
            ->role('agent')
            ->where('is_active', true)
            ->with('agentProfile')
            ->withCount(['properties' => fn (Builder $q) => $q->where('status', 'published')])
            ->find($agentId);
    }

    public function paginatePublishedByAgent(int $agentId, int $perPage = 12): LengthAwarePaginator
    {
        return $this->model->query()
            ->where('agent_id', $agentId)
            ->where('status', 'published')
            ->with(['images' => fn ($q) => $q->where('is_cover', true)])
            ->latest('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function toggleFavorite(User $user, Property $property): bool
    {
        $existing = $user->favoriteProperties()->where('property_id', $property->id)->exists();

        if ($existing) {
            $user->favoriteProperties()->detach($property->id);

            return false;
        }

        $user->favoriteProperties()->attach($property->id);

        return true;
    }

    public function favoritedIds(User $user): array
    {
        return $user->favoriteProperties()->pluck('properties.id')->all();
    }

    public function paginateFavorites(User $user, int $perPage = 12): LengthAwarePaginator
    {
        return $user->favoriteProperties()
            ->with(['images' => fn ($q) => $q->where('is_cover', true), 'agent'])
            ->latest('favorites.created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function attachFavoriteFlags(iterable $properties, ?User $user): void
    {
        $favoriteIds = $user ? $this->favoritedIds($user) : [];

        foreach ($properties as $property) {
            $property->setAttribute('is_favorited', in_array($property->id, $favoriteIds, true));
        }
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title) ?: Str::random(8);
        $original = $slug;
        $i = 1;

        while (
            $this->model->query()
                ->where('slug', $slug)
                ->when($ignoreId, fn (Builder $q, $id) => $q->where('id', '!=', $id))
                ->exists()
        ) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }
}
