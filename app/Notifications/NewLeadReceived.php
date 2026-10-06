<?php

namespace App\Notifications;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLeadReceived extends Notification
{
    use Queueable;

    public function __construct(private Lead $lead)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $propertyTitle = $this->lead->property?->title ?? 'عقار محذوف';

        return (new MailMessage)
            ->subject('طلب تواصل جديد - أركورا')
            ->greeting('مرحباً ' . $notifiable->name)
            ->line("لديك طلب تواصل جديد بخصوص: {$propertyTitle}")
            ->line("الاسم: {$this->lead->name}")
            ->line("البريد الإلكتروني: {$this->lead->email}")
            ->line($this->lead->phone ? "الهاتف: {$this->lead->phone}" : '')
            ->line('الرسالة:')
            ->line($this->lead->message)
            ->action('عرض طلبات التواصل', route('dashboard.leads.index'))
            ->line('شكراً لاستخدامك منصة أركورا.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'lead_id' => $this->lead->id,
            'property_id' => $this->lead->property_id,
            'property_title' => $this->lead->property?->title,
            'name' => $this->lead->name,
            'message' => $this->lead->message,
        ];
    }
}
