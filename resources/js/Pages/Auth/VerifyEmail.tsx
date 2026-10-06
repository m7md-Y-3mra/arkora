import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/components/ui/button';

export default function VerifyEmail({ status }: { status?: string }) {
    const [processing, setProcessing] = useState(false);

    const resend = () => {
        setProcessing(true);
        router.post(route('verification.send'), {}, { onFinish: () => setProcessing(false) });
    };

    return (
        <GuestLayout>
            <Head title="تأكيد البريد الإلكتروني" />

            <h1 className="font-heading text-3xl text-foreground">تأكيد البريد الإلكتروني</h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                شكرًا لتسجيلك! قبل البدء، يرجى تأكيد بريدك الإلكتروني من خلال
                الرابط الذي أرسلناه لك. إذا لم تستلم الرسالة يمكنك طلب رسالة
                جديدة.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mt-4 text-sm font-medium text-emerald-600">
                    تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني.
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <Button onClick={resend} disabled={processing} className="rounded-none bg-onyx-900 hover:bg-onyx-800">
                    إعادة إرسال رسالة التأكيد
                </Button>

                <Link href={route('logout')} method="post" as="button" className="text-sm text-muted-foreground hover:underline">
                    تسجيل الخروج
                </Link>
            </div>
        </GuestLayout>
    );
}
