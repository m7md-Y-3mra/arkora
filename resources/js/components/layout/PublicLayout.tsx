import { useEffect, type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import type { PageProps } from '@/types';

export function PublicLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="flex min-h-screen flex-col bg-alabaster">
            <PublicNavbar />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
