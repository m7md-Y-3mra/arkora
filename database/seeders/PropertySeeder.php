<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $agents = User::factory()
            ->count(8)
            ->create()
            ->each(function (User $agent) {
                $agent->syncRoles(['agent']);
                $agent->agentProfile()->create([
                    'agency_name' => fake()->company() . ' للعقارات',
                    'license_number' => fake()->numerify('REL-#####'),
                    'years_experience' => fake()->numberBetween(1, 20),
                    'whatsapp' => fake()->numerify('05########'),
                    'bio' => fake()->paragraph(),
                ]);
            });

        $clients = User::factory()
            ->count(15)
            ->create()
            ->each(fn (User $client) => $client->syncRoles(['client']));

        $amenityIds = Amenity::pluck('id');

        Property::factory()
            ->count(60)
            ->make()
            ->each(function (Property $property) use ($agents, $amenityIds) {
                $property->agent_id = $agents->random()->id;
                $property->save();
                $property->amenities()->sync(
                    $amenityIds->random(fake()->numberBetween(2, 6))->all()
                );

                $imageCount = fake()->numberBetween(3, 6);
                for ($i = 0; $i < $imageCount; $i++) {
                    $property->images()->create([
                        'path' => "https://picsum.photos/seed/arkora-{$property->id}-{$i}/1200/900",
                        'sort_order' => $i,
                        'is_cover' => $i === 0,
                    ]);
                }
            });

        $publishedProperties = Property::where('status', 'published')->get();

        foreach ($clients as $client) {
            $leadCount = fake()->numberBetween(1, 3);

            for ($i = 0; $i < $leadCount; $i++) {
                $property = $publishedProperties->random();

                Lead::factory()->create([
                    'property_id' => $property->id,
                    'agent_id' => $property->agent_id,
                    'name' => $client->name,
                    'email' => $client->email,
                ]);
            }
        }
    }
}
