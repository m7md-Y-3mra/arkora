<?php

namespace App\Repositories\Contracts;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PropertyRepositoryInterface
{
    public function paginatePublished(array $filters, int $perPage = 12): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): ?Property;

    public function findById(int $id): ?Property;

    public function featured(int $limit = 6): Collection;

    public function paginateForDashboard(?int $agentId, array $filters, int $perPage = 15): LengthAwarePaginator;

    public function create(array $data): Property;

    public function update(Property $property, array $data): Property;

    public function delete(Property $property): bool;

    public function bulkUpdateStatus(array $ids, string $status, ?int $agentId): int;

    public function bulkDelete(array $ids, ?int $agentId): int;

    public function incrementViews(Property $property): void;

    public function syncAmenities(Property $property, array $amenityIds): void;

    public function syncImages(Property $property, array $images): void;

    public function dashboardStats(?int $agentId): array;

    public function countsByType(?int $agentId): array;

    public function agentsWithListings(): Collection;

    public function findAgentProfile(int $agentId): ?User;

    public function paginatePublishedByAgent(int $agentId, int $perPage = 12): LengthAwarePaginator;

    public function toggleFavorite(User $user, Property $property): bool;

    public function favoritedIds(User $user): array;

    public function paginateFavorites(User $user, int $perPage = 12): LengthAwarePaginator;

    public function attachFavoriteFlags(iterable $properties, ?User $user): void;
}
