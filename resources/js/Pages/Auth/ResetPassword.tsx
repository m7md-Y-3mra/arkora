import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyServerErrors } from '@/lib/inertia-form';

const schema = z
    .object({
        token: z.string(),
        email: z.email('صيغة البريد الإلكتروني غير صحيحة'),
        password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'تأكيد كلمة المرور غير متطابق',
        path: ['password_confirmation'],
    });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { token, email, password: '', password_confirmation: '' },
    });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.post(route('password.store'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="إعادة تعيين كلمة المرور" />

            <h1 className="font-heading text-3xl text-foreground">إعادة تعيين كلمة المرور</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
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

                <Button type="submit" className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800" disabled={processing}>
                    إعادة تعيين كلمة المرور
                </Button>
            </form>
        </GuestLayout>
    );
}
