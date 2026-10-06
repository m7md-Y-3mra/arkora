import { Head, Link, router } from '@inertiajs/react';
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
        name: z.string().min(2, 'الاسم مطلوب'),
        email: z.email('صيغة البريد الإلكتروني غير صحيحة').min(1, 'البريد الإلكتروني مطلوب'),
        password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'تأكيد كلمة المرور غير متطابق',
        path: ['password_confirmation'],
    });

type FormValues = z.infer<typeof schema>;

export default function Register() {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
    });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.post(route('register'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="إنشاء حساب" />

            <h1 className="font-heading text-3xl text-foreground">إنشاء حساب جديد</h1>
            <p className="mt-2 text-sm text-muted-foreground">انضم إلى أركورا وابدأ رحلتك العقارية</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input id="name" autoComplete="name" {...register('name')} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" autoComplete="username" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        {...register('password_confirmation')}
                    />
                    {errors.password_confirmation && (
                        <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800" disabled={processing}>
                    إنشاء الحساب
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link href={route('login')} className="text-bronze-600 hover:underline">
                    تسجيل الدخول
                </Link>
            </p>
        </GuestLayout>
    );
}
