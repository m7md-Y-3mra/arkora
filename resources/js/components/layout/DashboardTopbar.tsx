import { Link, usePage } from '@inertiajs/react';
import { Menu, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { roleLabel } from '@/lib/format';
import type { PageProps } from '@/types';

export function DashboardTopbar({ title }: { title: string }) {
    const { auth } = usePage<PageProps>().props;
    const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);

    return (
        <header className="flex h-20 items-center justify-between border-b border-border bg-background px-6">
            <div className="flex items-center gap-4">
                <button type="button" className="lg:hidden" onClick={toggleSidebar} aria-label="القائمة">
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="font-heading text-2xl text-foreground">{title}</h1>
            </div>

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
        </header>
    );
}
