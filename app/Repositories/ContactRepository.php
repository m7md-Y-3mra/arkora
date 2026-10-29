<?php

namespace App\Repositories;

use App\Models\Contact;
use App\Models\LeadActivity;
use App\Repositories\Contracts\ContactRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ContactRepository implements ContactRepositoryInterface
{
    public function __construct(private Contact $model)
    {
    }

    public function paginateForAgent(?int $agentId, array $filters, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->query()
            ->with('agent:id,name')
            ->withCount('leads')
            ->withMax('leads', 'created_at')
            ->when($agentId, fn (Builder $q) => $q->where('agent_id', $agentId))
            ->when($filters['search'] ?? null, function (Builder $q, $term) {
                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('name', 'ilike', "%{$term}%")
                        ->orWhere('email', 'ilike', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->orderByDesc('leads_max_created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findForDetail(Contact $contact): Contact
    {
        return $contact->load(['agent:id,name', 'leads.property:id,title,slug']);
    }

    public function recentActivities(Contact $contact, int $limit = 30): Collection
    {
        return LeadActivity::query()
            ->with(['user:id,name', 'lead:id,name,property_id', 'lead.property:id,title'])
            ->whereIn('lead_id', $contact->leads()->select('id'))
            ->latest()
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    public function update(Contact $contact, array $data): Contact
    {
        $contact->update($data);

        return $contact->refresh();
    }
}
