<?php

namespace App\Repositories;

use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

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

    public function trendLast14Days(?int $agentId): array
    {
        $start = Carbon::now()->subDays(13)->startOfDay();

        $rows = $this->model->query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->where('created_at', '>=', $start)
            ->groupBy('day')
            ->pluck('count', 'day');

        $trend = [];
        for ($i = 0; $i < 14; $i++) {
            $date = $start->copy()->addDays($i)->format('Y-m-d');
            $trend[] = [
                'date' => $date,
                'count' => (int) ($rows[$date] ?? 0),
            ];
        }

        return $trend;
    }
}
