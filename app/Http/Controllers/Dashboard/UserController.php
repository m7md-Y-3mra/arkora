<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private UserRepositoryInterface $users)
    {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role']);

        return Inertia::render('Dashboard/Users/Index', [
            'users' => $this->users->paginate(array_filter($filters), 15),
            'filters' => $filters,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $role = $data['role'];
        unset($data['role']);

        $user = $this->users->create($data);
        $this->users->assignRole($user, $role);

        return redirect()->route('dashboard.users.index')->with('success', 'تم إنشاء المستخدم بنجاح.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $role = $data['role'];
        unset($data['role']);

        $this->users->update($user, $data);
        $this->users->assignRole($user, $role);

        return redirect()->route('dashboard.users.index')->with('success', 'تم تحديث المستخدم بنجاح.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($request->user()->id === $user->id, 403, 'لا يمكنك حذف حسابك الخاص.');

        $this->users->delete($user);

        return redirect()->route('dashboard.users.index')->with('success', 'تم حذف المستخدم.');
    }
}
