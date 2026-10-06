import { useEffect, type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import type { PageProps } from '@/types';

export function DashboardLayout({ title, children }: PropsWithChildren<{ title: string }>) {
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="flex min-h-screen bg-muted/40">
            <DashboardSidebar />
            <div className="flex min-h-screen flex-1 flex-col lg:ms-0">
                <DashboardTopbar title={title} />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
