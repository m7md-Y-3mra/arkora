import { Head, router } from '@inertiajs/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLinks } from '@/components/dashboard/PageLinks';
import { TaskRow } from '@/components/crm/TaskList';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/format';
import type { LeadTask, PaginatedResponse } from '@/types/models';

type Bucket = 'overdue' | 'today' | 'upcoming' | 'done';

const bucketLabels: Record<Bucket, string> = {
    overdue: 'متأخرة',
    today: 'اليوم',
    upcoming: 'قادمة',
    done: 'منجزة',
};

const emptyMessages: Record<Bucket, string> = {
    overdue: 'لا توجد مهام متأخرة. عمل رائع!',
    today: 'لا توجد مهام لبقية اليوم.',
    upcoming: 'لا توجد مهام قادمة.',
    done: 'لم تُنجز أي مهمة بعد.',
};

export default function TasksIndex({
    tasks,
    counts,
    bucket,
}: {
    tasks: PaginatedResponse<LeadTask>;
    counts: Record<Bucket, number>;
    bucket: Bucket;
}) {
    const changeBucket = (next: string) => {
        router.get(route('dashboard.tasks.index'), { bucket: next }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title="المهام">
            <Head title="المهام" />

            <Tabs value={bucket} onValueChange={changeBucket}>
                <TabsList className="h-auto flex-wrap rounded-none">
                    {(Object.keys(bucketLabels) as Bucket[]).map((key) => (
                        <TabsTrigger key={key} value={key} className="gap-2 rounded-none">
                            {bucketLabels[key]}
                            <span className={key === 'overdue' && counts.overdue > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                                {formatNumber(counts[key])}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Card className="mt-6 rounded-sm">
                <CardContent className="p-6">
                    {tasks.data.map((task) => (
                        <TaskRow key={task.id} task={task} showLead />
                    ))}
                    {tasks.data.length === 0 && <p className="py-12 text-center text-muted-foreground">{emptyMessages[bucket]}</p>}
                </CardContent>
            </Card>

            <PageLinks page={tasks} />
        </DashboardLayout>
    );
}
