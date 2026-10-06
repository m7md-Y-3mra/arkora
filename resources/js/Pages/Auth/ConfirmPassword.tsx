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
    password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type FormValues = z.infer<typeof schema>;

export default function ConfirmPassword() {
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { password: '' } });

    const onSubmit = (values: FormValues) => {
        setProcessing(true);
        router.post(route('password.confirm'), values, {
            onError: (serverErrors) => applyServerErrors(serverErrors as Record<string, string>, setError),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <GuestLayout>
            <Head title="تأكيد كلمة المرور" />

            <h1 className="font-heading text-3xl text-foreground">تأكيد كلمة المرور</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                هذه منطقة محمية، يرجى تأكيد كلمة المرور قبل الاستمرار
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" type="password" autoFocus {...register('password')} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <Button type="submit" className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800" disabled={processing}>
                    تأكيد
                </Button>
            </form>
        </GuestLayout>
    );
}
