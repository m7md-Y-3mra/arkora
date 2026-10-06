import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    MessageSquareText,
    Users,
    UserCircle,
    LogOut,
} from 'lucide-react';
import { ArkoraLogo } from '@/components/ArkoraLogo';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import { useDashboardStore } from '@/stores/useDashboardStore';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: Array<'admin' | 'agent' | 'client'>;
    active: boolean;
}

export function DashboardSidebar() {
    const { props: { auth }, url: currentUrl } = usePage<PageProps>();
    const roles = auth.roles ?? [];
    const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);
    const closeSidebar = useDashboardStore((s) => s.closeSidebar);

    const items: NavItem[] = [
        {
            href: route('dashboard'),
            label: 'نظرة عامة',
            icon: LayoutDashboard,
            active: currentUrl === '/dashboard',
        },
        {
            href: route('dashboard.properties.index'),
            label: 'العقارات',
            icon: Building2,
            roles: ['admin', 'agent'],
            active: currentUrl.startsWith('/dashboard/properties'),
        },
        {
            href: route('dashboard.leads.index'),
            label: 'طلبات التواصل',
            icon: MessageSquareText,
            roles: ['admin', 'agent'],
            active: currentUrl.startsWith('/dashboard/leads'),
        },
        {
            href: route('dashboard.users.index'),
            label: 'المستخدمون',
            icon: Users,
            roles: ['admin'],
            active: currentUrl.startsWith('/dashboard/users'),
        },
        {
            href: route('profile.edit'),
            label: 'الملف الشخصي',
            icon: UserCircle,
            active: currentUrl === '/profile',
        },
    ];

    const visibleItems = items.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)));

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-onyx-950/50 lg:hidden"
                    onClick={closeSidebar}
                />
            )}
            <aside
                className={cn(
                    'fixed inset-y-0 right-0 z-50 w-72 shrink-0 border-s border-onyx-800 bg-onyx-900 text-alabaster transition-transform lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
                )}
            >
                <div className="flex h-20 items-center border-b border-onyx-800 px-6">
                    <Link href={route('home')}>
                        <ArkoraLogo className="text-alabaster" />
                    </Link>
                </div>

                <nav className="flex flex-col gap-1 p-4">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={cn(
                                    'flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium transition-colors',
                                    item.active
                                        ? 'bg-bronze-500/15 text-bronze-300'
                                        : 'text-onyx-200 hover:bg-onyx-800 hover:text-alabaster',
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-4 flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium text-onyx-200 transition-colors hover:bg-onyx-800 hover:text-alabaster"
                    >
                        <LogOut className="h-5 w-5" />
                        تسجيل الخروج
                    </Link>
                </nav>
            </aside>
        </>
    );
}
