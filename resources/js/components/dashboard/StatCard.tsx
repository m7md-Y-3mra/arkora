import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
    label,
    value,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    accent?: boolean;
}) {
    return (
        <Card className={cn('rounded-sm border-border', accent && 'border-bronze-400')}>
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 font-heading text-3xl text-foreground">{value}</p>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full bg-onyx-900/5', accent && 'bg-bronze-500/15')}>
                    <Icon className={cn('h-6 w-6 text-onyx-700', accent && 'text-bronze-600')} />
                </div>
            </CardContent>
        </Card>
    );
}
