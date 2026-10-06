import { Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyServerErrors } from '@/lib/inertia-form';
import type { PageProps } from '@/types';

const schema = z.object({
    name: z.string().min(2, 'الاسم مطلوب'),
    email: z.email('صيغة البريد الإلكتروني غير صحيحة'),
    phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function UpdateProfileInformationForm({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: auth.user?.name ?? '',
            email: auth.user?.email ?? '',
            phone: auth.user?.phone ?? '',
        },
    });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.patch(route('profile.update'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <section>
            <h2 className="font-heading text-xl text-foreground">المعلومات الشخصية</h2>
            <p className="mt-1 text-sm text-muted-foreground">تحديث الاسم والبريد الإلكتروني ورقم الهاتف</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" {...register('phone')} />
                </div>

                {mustVerifyEmail && (
                    <p className="text-sm text-muted-foreground">
                        بريدك الإلكتروني غير مؤكد.{' '}
                        <Link href={route('verification.send')} method="post" as="button" className="text-bronze-600 hover:underline">
                            إعادة إرسال رسالة التأكيد
                        </Link>
                    </p>
                )}

                {status === 'verification-link-sent' && (
                    <p className="text-sm font-medium text-emerald-600">تم إرسال رابط تأكيد جديد.</p>
                )}

                <Button type="submit" disabled={processing} className="rounded-none bg-onyx-900 hover:bg-onyx-800">
                    حفظ التغييرات
                </Button>
            </form>
        </section>
    );
}
