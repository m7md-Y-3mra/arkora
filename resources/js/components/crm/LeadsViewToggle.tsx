import { Link } from '@inertiajs/react';
import { Columns3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeadsViewToggle({ current }: { current: 'list' | 'board' }) {
    const options = [
        { key: 'list', label: 'قائمة', icon: List, href: route('dashboard.leads.index') },
        { key: 'board', label: 'لوحة المراحل', icon: Columns3, href: route('dashboard.leads.board') },
    ] as const;

    return (
        <div className="inline-flex border border-border">
            {options.map(({ key, label, icon: Icon, href }) => (
                <Link
                    key={key}
                    href={href}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                        current === key ? 'bg-onyx-900 text-alabaster' : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </Link>
            ))}
        </div>
    );
}
