import { Link, router, usePage } from '@inertiajs/react';
import { Menu, ChevronDown, Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { roleLabel } from '@/lib/format';
import type { PageProps } from '@/types';

export function DashboardTopbar({ title }: { title: string }) {
    const { auth, notifications } = usePage<PageProps>().props;
    const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);

    const markAllRead = () => router.post(route('notifications.read-all'), {}, { preserveScroll: true });
    const markRead = (id: string) => router.post(route('notifications.read', id), {}, { preserveScroll: true });

    return (
        <header className="flex h-20 items-center justify-between border-b border-border bg-background px-6">
            <div className="flex items-center gap-4">
                <button type="button" className="lg:hidden" onClick={toggleSidebar} aria-label="القائمة">
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="font-heading text-2xl text-foreground">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border">
                        <Bell className="h-5 w-5" />
                        {notifications.unread_count > 0 && (
                            <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                {notifications.unread_count > 9 ? '9+' : notifications.unread_count}
                            </span>
                        )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <DropdownMenuLabel className="p-0">الإشعارات</DropdownMenuLabel>
                            {notifications.unread_count > 0 && (
                                <button onClick={markAllRead} className="text-xs text-bronze-600 hover:underline">
                                    تعليم الكل كمقروء
                                </button>
                            )}
                        </div>
                        <DropdownMenuSeparator />
                        {notifications.recent.length === 0 && (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">لا توجد إشعارات حالياً.</p>
                        )}
                        {notifications.recent.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                onClick={() => !n.read_at && markRead(n.id)}
                                className="flex flex-col items-start gap-1 whitespace-normal py-2"
                            >
                                <span className={`text-sm ${!n.read_at ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                    طلب جديد من {n.data.name}
                                </span>
                                {n.data.property_title && (
                                    <span className="text-xs text-muted-foreground">{n.data.property_title}</span>
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 rounded-sm border border-border px-4 py-2 text-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-onyx-900 text-xs font-bold text-alabaster">
                        {auth.user?.name?.charAt(0)}
                    </span>
                    <span className="hidden text-start sm:block">
                        <span className="block font-medium">{auth.user?.name}</span>
                        <span className="block text-xs text-muted-foreground">
                            {auth.roles?.[0] ? roleLabel(auth.roles[0]) : ''}
                        </span>
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={route('profile.edit')}>الملف الشخصي</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={route('logout')} method="post" as="button" className="w-full">
                            تسجيل الخروج
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
