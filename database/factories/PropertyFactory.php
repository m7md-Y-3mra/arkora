<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    private array $cityDistricts = [
        'الرياض' => ['العليا', 'النرجس', 'الملقا', 'حطين', 'الياسمين', 'السليمانية'],
        'جدة' => ['الشاطئ', 'الروضة', 'الزهراء', 'الصفا', 'النعيم', 'المرجان'],
        'الدمام' => ['الشاطئ', 'الفيصلية', 'الريان', 'الصفا', 'الواحة'],
        'مكة المكرمة' => ['العزيزية', 'الزهراء', 'النسيم', 'الشوقية'],
        'الخبر' => ['الراكة', 'العقربية', 'الثقبة', 'الحزام الذهبي'],
    ];

    private array $titlesByType = [
        'apartment' => 'شقة فاخرة',
        'villa' => 'فيلا راقية',
        'townhouse' => 'تاون هاوس عصري',
        'land' => 'أرض سكنية مميزة',
        'office' => 'مكتب تجاري',
        'shop' => 'محل تجاري',
        'building' => 'عمارة استثمارية',
    ];

    public function definition(): array
    {
        $type = fake()->randomElement(array_keys($this->titlesByType));
        $purpose = fake()->randomElement(['sale', 'rent']);
        $city = fake()->randomElement(array_keys($this->cityDistricts));
        $district = fake()->randomElement($this->cityDistricts[$city]);
        $title = "{$this->titlesByType[$type]} في حي {$district}";
        $status = fake()->randomElement(['published', 'published', 'published', 'draft', 'archived']);

        $basePrice = match ($type) {
            'land' => fake()->numberBetween(300_000, 2_500_000),
            'villa', 'building' => fake()->numberBetween(900_000, 5_000_000),
            'office', 'shop' => fake()->numberBetween(200_000, 1_500_000),
            default => fake()->numberBetween(180_000, 900_000),
        };

        $price = $purpose === 'rent' ? (int) ($basePrice * 0.06) : $basePrice;

        return [
            'agent_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title) . '-' . fake()->unique()->numberBetween(1000, 999999),
            'description' => fake()->paragraphs(3, true),
            'type' => $type,
            'purpose' => $purpose,
            'status' => $status,
            'price' => $price,
            'area_sqm' => fake()->numberBetween(80, 600),
            'bedrooms' => in_array($type, ['land']) ? 0 : fake()->numberBetween(1, 7),
            'bathrooms' => in_array($type, ['land']) ? 0 : fake()->numberBetween(1, 5),
            'floor' => in_array($type, ['villa', 'land']) ? null : fake()->numberBetween(1, 20),
            'year_built' => fake()->numberBetween(2000, 2026),
            'city' => $city,
            'district' => $district,
            'address_line' => "شارع {$district}، {$city}",
            'latitude' => fake()->latitude(16, 32),
            'longitude' => fake()->longitude(36, 50),
            'is_featured' => fake()->boolean(20),
            'views_count' => fake()->numberBetween(0, 2000),
            'published_at' => $status === 'published' ? fake()->dateTimeBetween('-6 months') : null,
        ];
    }
}
