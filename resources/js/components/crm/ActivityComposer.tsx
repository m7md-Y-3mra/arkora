import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { activityTypeLabel } from '@/lib/format';
import { applyServerErrors } from '@/lib/inertia-form';

const MANUAL_TYPES = ['note', 'call', 'email', 'meeting'] as const;

const schema = z.object({
    type: z.enum(MANUAL_TYPES),
    body: z.string().trim().min(1, 'اكتب تفاصيل النشاط'),
});

type Values = z.infer<typeof schema>;

export function ActivityComposer({ leadId }: { leadId: number }) {
    const { register, handleSubmit, setValue, watch, reset, setError, formState } = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { type: 'note', body: '' },
    });

    const onSubmit = (values: Values) =>
        new Promise<void>((resolve) => {
            router.post(route('dashboard.leads.activities.store', leadId), values, {
                preserveScroll: true,
                onSuccess: () => reset({ type: values.type, body: '' }),
                onError: (errors) => applyServerErrors(errors, setError),
                onFinish: () => resolve(),
            });
        });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as Values['type'])}>
                    <SelectTrigger className="w-40 rounded-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MANUAL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {activityTypeLabel(type)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Textarea {...register('body')} rows={3} placeholder="ماذا حدث؟ مثال: اتصلت بالعميل واتفقنا على موعد معاينة..." className="rounded-none" />
            {formState.errors.body && <p className="text-sm text-destructive">{formState.errors.body.message}</p>}
            <Button type="submit" disabled={formState.isSubmitting} className="rounded-none">
                إضافة النشاط
            </Button>
        </form>
    );
}
