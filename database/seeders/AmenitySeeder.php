<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            'مسبح', 'صالة رياضية', 'موقف سيارات', 'أمن وحراسة', 'مصعد',
            'حديقة', 'مجلس', 'غرفة خادمة', 'تكييف مركزي', 'مطبخ راكب',
            'إنترنت فائق السرعة', 'نظام ذكي', 'شرفة', 'غرفة سائق', 'ملعب أطفال',
        ];

        foreach ($amenities as $name) {
            Amenity::firstOrCreate(['slug' => Str::slug($name)], ['name' => $name]);
        }
    }
}
