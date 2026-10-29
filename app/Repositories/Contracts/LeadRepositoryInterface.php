<?php

namespace App\Repositories\Contracts;

use App\Enums\LeadStage;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface LeadRepositoryInterface
{
    public function paginateForAgent(?int $agentId, array $filters, int $perPage = 15): LengthAwarePaginator;

    public function board(?int $agentId, array $filters): Collection;

    public function findForDetail(Lead $lead): Lead;

    public function create(array $data): Lead;

    public function updateStatus(Lead $lead, LeadStage $status, ?User $actor = null): Lead;

    public function assign(Lead $lead, User $agent, User $actor): Lead;

    public function addActivity(Lead $lead, ?User $actor, string $type, ?string $body = null, ?array $meta = null): LeadActivity;

    public function countNew(?int $agentId): int;

    public function countsByStage(?int $agentId): array;

    public function conversionRate(?int $agentId): ?float;

    public function trendLast14Days(?int $agentId): array;
}
