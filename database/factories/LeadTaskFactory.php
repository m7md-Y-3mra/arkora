<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeadTask>
 */
class LeadTaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->randomElement(['اتصال متابعة', 'إرسال عرض سعر', 'ترتيب موعد معاينة', 'تأكيد الأوراق']),
            'due_at' => fake()->dateTimeBetween('-3 days', '+7 days'),
        ];
    }
}
