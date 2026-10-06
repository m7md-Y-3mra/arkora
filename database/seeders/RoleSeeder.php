<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'agent', 'client'] as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $admin = User::firstOrCreate(
            ['email' => 'admin@arkora.test'],
            [
                'name' => 'مدير أركورا',
                'password' => bcrypt('password'),
                'phone' => '0501234567',
                'email_verified_at' => now(),
            ],
        );
        $admin->syncRoles(['admin']);
    }
}
