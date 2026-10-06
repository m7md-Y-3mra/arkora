<?php

namespace App\Repositories\Contracts;

use App\Models\Lead;
use Illuminate\Pagination\LengthAwarePaginator;

interface LeadRepositoryInterface
{
    public function paginateForAgent(?int $agentId, array $filters, int $perPage = 15): LengthAwarePaginator;

    public function create(array $data): Lead;

    public function updateStatus(Lead $lead, string $status): Lead;

    public function countNew(?int $agentId): int;

    public function trendLast14Days(?int $agentId): array;
}
