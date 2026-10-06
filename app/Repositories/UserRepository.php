<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(private User $model)
    {
    }

    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->query()
            ->with('roles')
            ->when($filters['role'] ?? null, fn (Builder $q, $role) => $q->role($role))
            ->when($filters['search'] ?? null, function (Builder $q, $term) {
                $q->where(function (Builder $sub) use ($term) {
                    $sub->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        return $this->model->create($data);
    }

    public function update(User $user, array $data): User
    {
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->refresh();
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function assignRole(User $user, string $role): User
    {
        $user->syncRoles([$role]);

        return $user->refresh();
    }
}
