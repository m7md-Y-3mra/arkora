import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyServerErrors } from '@/lib/inertia-form';

const schema = z
    .object({
        current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
        password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'تأكيد كلمة المرور غير متطابق',
        path: ['password_confirmation'],
    });

type FormValues = z.infer<typeof schema>;

export function UpdatePasswordForm() {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { current_password: '', password: '', password_confirmation: '' },
    });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.put(route('password.update'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onSuccess: () => reset(),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <section>
            <h2 className="font-heading text-xl text-foreground">تغيير كلمة المرور</h2>
            <p className="mt-1 text-sm text-muted-foreground">استخدم كلمة مرور قوية للحفاظ على أمان حسابك</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                    <Input id="current_password" type="password" {...register('current_password')} />
                    {errors.current_password && (
                        <p className="text-sm text-destructive">{errors.current_password.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور الجديدة</Label>
                    <Input id="password" type="password" {...register('password')} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                    <Input id="password_confirmation" type="password" {...register('password_confirmation')} />
                    {errors.password_confirmation && (
                        <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="rounded-none bg-onyx-900 hover:bg-onyx-800">
                    حفظ كلمة المرور
                </Button>
            </form>
        </section>
    );
}
