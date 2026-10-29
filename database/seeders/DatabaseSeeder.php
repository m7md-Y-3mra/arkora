<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AmenitySeeder::class,
        ]);

        // Demo data is all-or-nothing so a failed run never leaves partial rows behind.
        DB::transaction(function () {
            $this->call(PropertySeeder::class);

            $demoAgent = User::firstOrCreate(
                ['email' => 'agent@arkora.test'],
                User::factory()->raw(['name' => 'أحمد العقاري', 'email' => 'agent@arkora.test']),
            );
            $demoAgent->syncRoles(['agent']);
            $demoAgent->agentProfile()->firstOrCreate([], [
                'agency_name' => 'أركورا للعقارات',
                'license_number' => 'REL-00001',
                'years_experience' => 10,
                'whatsapp' => '0501112233',
                'bio' => 'وكيل عقاري معتمد متخصص في العقارات السكنية والتجارية الفاخرة.',
            ]);

            $demoClient = User::firstOrCreate(
                ['email' => 'client@arkora.test'],
                User::factory()->raw(['name' => 'سارة العميلة', 'email' => 'client@arkora.test']),
            );
            $demoClient->syncRoles(['client']);

            $this->call(CrmSeeder::class);
        });
    }
}
