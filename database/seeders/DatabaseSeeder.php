<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AmenitySeeder::class,
            PropertySeeder::class,
        ]);

        $demoAgent = User::factory()->create([
            'name' => 'أحمد العقاري',
            'email' => 'agent@arkora.test',
        ]);
        $demoAgent->syncRoles(['agent']);
        $demoAgent->agentProfile()->create([
            'agency_name' => 'أركورا للعقارات',
            'license_number' => 'REL-00001',
            'years_experience' => 10,
            'whatsapp' => '0501112233',
            'bio' => 'وكيل عقاري معتمد متخصص في العقارات السكنية والتجارية الفاخرة.',
        ]);

        $demoClient = User::factory()->create([
            'name' => 'سارة العميلة',
            'email' => 'client@arkora.test',
        ]);
        $demoClient->syncRoles(['client']);
    }
}
