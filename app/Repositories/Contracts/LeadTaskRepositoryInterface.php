<?php

namespace App\Repositories\Contracts;

use App\Models\Lead;
use App\Models\LeadTask;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface LeadTaskRepositoryInterface
{
    public const BUCKETS = ['overdue', 'today', 'upcoming', 'done'];

    public function create(Lead $lead, array $data): LeadTask;

    public function toggleComplete(LeadTask $task): LeadTask;

    public function delete(LeadTask $task): void;

    public function paginateForAgent(?int $agentId, string $bucket, int $perPage = 20): LengthAwarePaginator;

    public function bucketCounts(?int $agentId): array;

    public function countOverdue(?int $agentId): int;

    public function upcoming(?int $agentId, int $limit = 5): Collection;
}
