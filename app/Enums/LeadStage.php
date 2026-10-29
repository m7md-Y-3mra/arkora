<?php

namespace App\Enums;

enum LeadStage: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case Viewing = 'viewing';
    case Negotiation = 'negotiation';
    case Won = 'won';
    case Lost = 'lost';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Stages a lead can still move out of.
     *
     * @return list<self>
     */
    public static function open(): array
    {
        return [self::New, self::Contacted, self::Viewing, self::Negotiation];
    }

    public function isClosed(): bool
    {
        return $this === self::Won || $this === self::Lost;
    }

    public function label(): string
    {
        return match ($this) {
            self::New => 'جديد',
            self::Contacted => 'تم التواصل',
            self::Viewing => 'معاينة',
            self::Negotiation => 'تفاوض',
            self::Won => 'تم الإغلاق بنجاح',
            self::Lost => 'خسارة',
        };
    }
}
