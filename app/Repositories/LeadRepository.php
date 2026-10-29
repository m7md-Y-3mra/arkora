<?php

namespace App\Repositories;

use App\Enums\LeadStage;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\User;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class LeadRepository implements LeadRepositoryInterface
{
    public function __construct(private Lead $model)
    {
    }

    public function paginateForAgent(?int $agentId, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->filtered($agentId, $filters)
            ->with(['property', 'contact'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function board(?int $agentId, array $filters): Collection
    {
        $closedCutoff = Carbon::now()->subDays(30);

        return $this->filtered($agentId, $filters)
            ->with(['property:id,title,slug', 'agent:id,name'])
            ->where(function (Builder $q) use ($closedCutoff) {
                $q->whereIn('status', LeadStage::open())
                    ->orWhere('updated_at', '>=', $closedCutoff);
            })
            ->latest('updated_at')
            ->get();
    }

    public function findForDetail(Lead $lead): Lead
    {
        return $lead->load([
            'property:id,title,slug,city,district',
            'agent:id,name,email',
            'contact',
            'activities.user:id,name',
            'tasks.user:id,name',
        ]);
    }

    public function create(array $data): Lead
    {
        return DB::transaction(function () use ($data) {
            $contact = $this->contactFor((int) $data['agent_id'], $data['email'], $data['name'], $data['phone'] ?? null);

            return $this->model->create([...$data, 'contact_id' => $contact->id]);
        });
    }

    public function updateStatus(Lead $lead, LeadStage $status, ?User $actor = null): Lead
    {
        $from = $lead->status;

        if ($from === $status) {
            return $lead;
        }

        DB::transaction(function () use ($lead, $status, $actor, $from) {
            $lead->update(['status' => $status]);
            $this->addActivity($lead, $actor, 'stage_change', null, [
                'from' => $from?->value,
                'to' => $status->value,
            ]);
        });

        return $lead->refresh();
    }

    public function assign(Lead $lead, User $agent, User $actor): Lead
    {
        $fromAgentId = $lead->agent_id;

        if ($fromAgentId === $agent->id) {
            return $lead;
        }

        DB::transaction(function () use ($lead, $agent, $actor, $fromAgentId) {
            $previousContact = $lead->contact;
            $contact = $this->contactFor($agent->id, $lead->email, $lead->name, $lead->phone);

            $lead->update(['agent_id' => $agent->id, 'contact_id' => $contact->id]);
            $lead->tasks()->open()->update(['user_id' => $agent->id]);

            // Don't leave the previous agent an empty contact for someone they no longer handle.
            if ($previousContact && ! $previousContact->notes && ! $previousContact->leads()->exists()) {
                $previousContact->delete();
            }

            $this->addActivity($lead, $actor, 'assignment', null, [
                'from_agent_id' => $fromAgentId,
                'to_agent_id' => $agent->id,
                'to_agent_name' => $agent->name,
            ]);
        });

        return $lead->refresh();
    }

    public function addActivity(Lead $lead, ?User $actor, string $type, ?string $body = null, ?array $meta = null): LeadActivity
    {
        return $lead->activities()->create([
            'user_id' => $actor?->id,
            'type' => $type,
            'body' => $body,
            'meta' => $meta,
        ]);
    }

    public function countNew(?int $agentId): int
    {
        return $this->model->query()
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->where('status', LeadStage::New)
            ->count();
    }

    public function countsByStage(?int $agentId): array
    {
        $rows = $this->model->query()
            ->selectRaw('status, COUNT(*) as count')
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->groupBy('status')
            ->toBase()
            ->pluck('count', 'status');

        return array_map(fn (LeadStage $stage) => [
            'stage' => $stage->value,
            'count' => (int) ($rows[$stage->value] ?? 0),
        ], LeadStage::cases());
    }

    public function conversionRate(?int $agentId): ?float
    {
        $counts = collect($this->countsByStage($agentId))->pluck('count', 'stage');
        $won = $counts[LeadStage::Won->value];
        $closed = $won + $counts[LeadStage::Lost->value];

        return $closed === 0 ? null : round($won / $closed * 100, 1);
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

    private function filtered(?int $agentId, array $filters): Builder
    {
        return $this->model->query()
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->when($filters['status'] ?? null, fn (Builder $q, $v) => $q->where('status', $v))
            ->when($filters['contact_id'] ?? null, fn (Builder $q, $v) => $q->where('contact_id', $v))
            ->when($filters['search'] ?? null, function (Builder $q, $term) {
                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('name', 'ilike', "%{$term}%")
                        ->orWhere('email', 'ilike', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            });
    }

    private function contactFor(int $agentId, string $email, string $name, ?string $phone): Contact
    {
        $contact = Contact::firstOrCreate(
            ['agent_id' => $agentId, 'email' => mb_strtolower(trim($email))],
            ['name' => $name, 'phone' => $phone],
        );

        if (! $contact->wasRecentlyCreated && $phone && ! $contact->phone) {
            $contact->update(['phone' => $phone]);
        }

        return $contact;
    }
}
