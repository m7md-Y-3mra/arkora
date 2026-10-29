<?php

namespace App\Repositories;

use App\Models\Lead;
use App\Models\LeadTask;
use App\Repositories\Contracts\LeadTaskRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class LeadTaskRepository implements LeadTaskRepositoryInterface
{
    public function __construct(private LeadTask $model)
    {
    }

    public function create(Lead $lead, array $data): LeadTask
    {
        // Tasks always belong to the lead's agent, even when an admin adds them.
        return $lead->tasks()->create([...$data, 'user_id' => $lead->agent_id]);
    }

    public function toggleComplete(LeadTask $task): LeadTask
    {
        $task->update(['completed_at' => $task->completed_at ? null : Carbon::now()]);

        return $task->refresh();
    }

    public function delete(LeadTask $task): void
    {
        $task->delete();
    }

    public function paginateForAgent(?int $agentId, string $bucket, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->bucket($this->forAgent($agentId), $bucket)
            ->with(['lead:id,name,status,property_id', 'lead.property:id,title', 'user:id,name']);

        $bucket === 'done'
            ? $query->latest('completed_at')
            : $query->orderBy('due_at');

        return $query->paginate($perPage)->withQueryString();
    }

    public function bucketCounts(?int $agentId): array
    {
        return collect(self::BUCKETS)
            ->mapWithKeys(fn (string $bucket) => [$bucket => $this->bucket($this->forAgent($agentId), $bucket)->count()])
            ->all();
    }

    public function countOverdue(?int $agentId): int
    {
        return $this->bucket($this->forAgent($agentId), 'overdue')->count();
    }

    public function upcoming(?int $agentId, int $limit = 5): Collection
    {
        return $this->forAgent($agentId)
            ->open()
            ->with('lead:id,name')
            ->orderBy('due_at')
            ->limit($limit)
            ->get();
    }

    private function forAgent(?int $agentId): Builder
    {
        return $this->model->query()->when($agentId, fn (Builder $q) => $q->where('user_id', $agentId));
    }

    private function bucket(Builder $query, string $bucket): Builder
    {
        $now = Carbon::now();

        return match ($bucket) {
            'overdue' => $query->whereNull('completed_at')->where('due_at', '<', $now),
            'today' => $query->whereNull('completed_at')->whereBetween('due_at', [$now, $now->copy()->endOfDay()]),
            'upcoming' => $query->whereNull('completed_at')->where('due_at', '>', $now->copy()->endOfDay()),
            'done' => $query->whereNotNull('completed_at'),
        };
    }
}
