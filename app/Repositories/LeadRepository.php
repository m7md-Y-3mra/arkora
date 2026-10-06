<?php

namespace App\Repositories;

use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class LeadRepository implements LeadRepositoryInterface
{
    public function __construct(private Lead $model)
    {
    }

    public function paginateForAgent(?int $agentId, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->query()
            ->with('property')
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->when($filters['status'] ?? null, fn (Builder $q, $v) => $q->where('status', $v))
            ->when($filters['search'] ?? null, function (Builder $q, $term) {
                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Lead
    {
        return $this->model->create($data);
    }

    public function updateStatus(Lead $lead, string $status): Lead
    {
        $lead->update(['status' => $status]);

        return $lead->refresh();
    }

    public function countNew(?int $agentId): int
    {
        return $this->model->query()
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->where('status', 'new')
            ->count();
    }
}
