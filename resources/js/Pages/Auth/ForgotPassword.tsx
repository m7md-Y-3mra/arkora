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

const schema = z.object({
    email: z.email('صيغة البريد الإلكتروني غير صحيحة').min(1, 'البريد الإلكتروني مطلوب'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword({ status }: { status?: string }) {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.post(route('password.email'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="استعادة كلمة المرور" />

            <h1 className="font-heading text-3xl text-foreground">استعادة كلمة المرور</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
            </p>

            {status && <div className="mt-4 text-sm font-medium text-emerald-600">{status}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800" disabled={processing}>
                    إرسال رابط الاستعادة
                </Button>
            </form>
        </GuestLayout>
    );
}
