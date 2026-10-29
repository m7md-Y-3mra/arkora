<?php

namespace Database\Seeders;

use App\Enums\LeadStage;
use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadTask;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CrmSeeder extends Seeder
{
    public function run(): void
    {
        if (LeadActivity::exists()) {
            $this->command?->info('CRM activity already seeded, skipping.');

            return;
        }

        $notes = [
            'call' => ['اتصلت بالعميل، مهتم ويرغب بزيارة العقار.', 'لم يرد على الاتصال، سأعاود المحاولة.', 'ناقشنا الميزانية وطرق الدفع.'],
            'email' => ['أرسلت تفاصيل العقار والمخطط.', 'أرسلت عرض السعر المحدّث.'],
            'meeting' => ['معاينة العقار مع العميل وعائلته.', 'اجتماع في المكتب لمراجعة العقد.'],
            'note' => ['يفضّل التواصل عبر واتساب مساءً.', 'يبحث عن عقار قريب من المدارس.'],
        ];
        $taskTitles = ['اتصال متابعة', 'إرسال عرض سعر', 'ترتيب موعد معاينة', 'تأكيد الأوراق المطلوبة'];

        Lead::query()->with('agent')->each(function (Lead $lead) use ($notes, $taskTitles) {
            $createdAt = Carbon::parse($lead->created_at);

            foreach (range(1, fake()->numberBetween(1, 3)) as $i) {
                $type = fake()->randomElement(array_keys($notes));
                $this->backdated($lead, [
                    'type' => $type,
                    'body' => fake()->randomElement($notes[$type]),
                ], $createdAt->copy()->addHours($i * fake()->numberBetween(4, 30)));
            }

            if ($lead->status !== LeadStage::New) {
                $this->backdated($lead, [
                    'type' => 'stage_change',
                    'meta' => ['from' => LeadStage::New->value, 'to' => $lead->status->value],
                ], $createdAt->copy()->addDays(2));
            }

            if (! $lead->status->isClosed() && fake()->boolean(70)) {
                LeadTask::create([
                    'lead_id' => $lead->id,
                    'user_id' => $lead->agent_id,
                    'title' => fake()->randomElement($taskTitles),
                    'due_at' => Carbon::now()->addHours(fake()->numberBetween(-72, 168)),
                ]);
            }
        });
    }

    private function backdated(Lead $lead, array $attributes, Carbon $at): void
    {
        // Activity timestamps are not fillable, so set them explicitly to spread the demo history out.
        (new LeadActivity)->forceFill([
            ...$attributes,
            'lead_id' => $lead->id,
            'user_id' => $lead->agent_id,
            'created_at' => $at,
            'updated_at' => $at,
        ])->save();
    }
}
