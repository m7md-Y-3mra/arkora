import { type PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { ArkoraLogo } from '@/components/ArkoraLogo';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden flex-col justify-between bg-onyx-900 p-12 text-alabaster lg:flex">
                <Link href={route('home')}>
                    <ArkoraLogo className="text-alabaster" />
                </Link>

                <div>
                    <h2 className="max-w-md font-heading text-4xl leading-tight">
                        اكتشف عقارك المثالي مع تجربة استثنائية وموثوقة
                    </h2>
                    <p className="mt-4 max-w-sm text-onyx-200">
                        منصة أركورا تجمع أفضل العقارات السكنية والتجارية مع وكلاء
                        موثوقين في مكان واحد.
                    </p>
                </div>

                <p className="text-sm text-onyx-400">
                    © {new Date().getFullYear()} أركورا. جميع الحقوق محفوظة.
                </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-alabaster p-6 sm:p-12">
                <div className="mb-8 lg:hidden">
                    <Link href={route('home')}>
                        <ArkoraLogo />
                    </Link>
                </div>
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}
