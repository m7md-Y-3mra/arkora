<?php

namespace App\Repositories\Contracts;

use App\Models\Contact;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ContactRepositoryInterface
{
    public function paginateForAgent(?int $agentId, array $filters, int $perPage = 20): LengthAwarePaginator;

    public function findForDetail(Contact $contact): Contact;

    public function recentActivities(Contact $contact, int $limit = 30): Collection;

    public function update(Contact $contact, array $data): Contact;
}
