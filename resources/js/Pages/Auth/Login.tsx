import { Head, Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { applyServerErrors } from '@/lib/inertia-form';

const schema = z.object({
    email: z.email('صيغة البريد الإلكتروني غير صحيحة').min(1, 'البريد الإلكتروني مطلوب'),
    password: z.string().min(1, 'كلمة المرور مطلوبة'),
    remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '', remember: false },
    });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.post(route('login'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            <h1 className="font-heading text-3xl text-foreground">تسجيل الدخول</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                أدخل بياناتك للوصول إلى حسابك في أركورا
            </p>

            {status && <div className="mt-4 text-sm font-medium text-emerald-600">{status}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" autoComplete="username" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={watch('remember')}
                            onCheckedChange={(checked) => setValue('remember', Boolean(checked))}
                        />
                        تذكرني
                    </label>

                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-sm text-bronze-600 hover:underline">
                            نسيت كلمة المرور؟
                        </Link>
                    )}
                </div>

                <Button type="submit" className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800" disabled={processing}>
                    تسجيل الدخول
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link href={route('register')} className="text-bronze-600 hover:underline">
                    إنشاء حساب جديد
                </Link>
            </p>
        </GuestLayout>
    );
}
