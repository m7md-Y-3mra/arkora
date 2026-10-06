import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { applyServerErrors } from '@/lib/inertia-form';

const schema = z.object({
    name: z.string().min(2, 'الاسم مطلوب'),
    email: z.email('صيغة البريد الإلكتروني غير صحيحة'),
    phone: z.string().optional(),
    message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
});

type FormValues = z.infer<typeof schema>;

export function ContactAgentForm({ propertyId, propertyTitle }: { propertyId: number; propertyTitle: string }) {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            message: `مرحباً، أنا مهتم بالعقار "${propertyTitle}". يرجى التواصل معي لمزيد من التفاصيل.`,
        },
    });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.post(route('properties.leads.store', propertyId), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onSuccess: () => reset(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="contact_name">الاسم</Label>
                <Input id="contact_name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact_email">البريد الإلكتروني</Label>
                <Input id="contact_email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact_phone">رقم الهاتف (اختياري)</Label>
                <Input id="contact_phone" {...register('phone')} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact_message">الرسالة</Label>
                <Textarea id="contact_message" rows={4} {...register('message')} />
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>

            <Button type="submit" disabled={processing} className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800">
                إرسال الطلب
            </Button>
        </form>
    );
}
