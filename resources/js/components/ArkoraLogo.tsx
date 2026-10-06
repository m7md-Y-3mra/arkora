import { cn } from '@/lib/utils';

export function ArkoraLogo({ className }: { className?: string }) {
    return (
        <span className={cn('font-heading text-2xl font-bold tracking-wide', className)}>
            أركورا
            <span className="text-bronze-500">.</span>
        </span>
    );
}
