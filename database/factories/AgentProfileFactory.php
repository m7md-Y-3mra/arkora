<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgentProfile>
 */
class AgentProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'agency_name' => fake()->company() . ' للعقارات',
            'license_number' => fake()->numerify('REL-#####'),
            'years_experience' => fake()->numberBetween(1, 20),
            'whatsapp' => fake()->numerify('05########'),
            'bio' => fake()->paragraph(),
        ];
    }
}
