import { Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/format';
import { applyServerErrors } from '@/lib/inertia-form';
import { cn } from '@/lib/utils';
import type { LeadTask } from '@/types/models';

export function isOverdue(task: LeadTask): boolean {
    return !task.completed_at && new Date(task.due_at) < new Date();
}

export function TaskRow({ task, showLead = false }: { task: LeadTask; showLead?: boolean }) {
    const overdue = isOverdue(task);

    return (
        <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
            <Checkbox
                checked={!!task.completed_at}
                onCheckedChange={() => router.patch(route('dashboard.tasks.toggle', task.id), {}, { preserveScroll: true })}
                className="mt-0.5"
                aria-label="إنجاز المهمة"
            />
            <div className="min-w-0 flex-1">
                <p className={cn('text-sm text-foreground', task.completed_at && 'text-muted-foreground line-through')}>
                    {task.title}
                </p>
                <p className={cn('text-xs text-muted-foreground', overdue && 'font-medium text-destructive')}>
                    {overdue ? 'متأخرة · ' : ''}
                    {formatDateTime(task.due_at)}
                    {task.user && ` · ${task.user.name}`}
                </p>
                {showLead && task.lead && (
                    <Link href={route('dashboard.leads.show', task.lead.id)} className="text-xs text-bronze-600 hover:underline">
                        {task.lead.name}
                        {task.lead.property && ` — ${task.lead.property.title}`}
                    </Link>
                )}
            </div>
            <button
                onClick={() => router.delete(route('dashboard.tasks.destroy', task.id), { preserveScroll: true })}
                className="text-muted-foreground hover:text-destructive"
                aria-label="حذف المهمة"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

const schema = z.object({
    title: z.string().trim().min(1, 'عنوان المهمة مطلوب'),
    due_at: z.string().min(1, 'حدد موعد المهمة'),
});

type Values = z.infer<typeof schema>;

function tomorrowAtTen(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskForm({ leadId }: { leadId: number }) {
    const { register, handleSubmit, reset, setError, formState } = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', due_at: tomorrowAtTen() },
    });

    const onSubmit = (values: Values) =>
        new Promise<void>((resolve) => {
            router.post(
                route('dashboard.leads.tasks.store', leadId),
                { ...values, due_at: new Date(values.due_at).toISOString() },
                {
                    preserveScroll: true,
                    onSuccess: () => reset({ title: '', due_at: tomorrowAtTen() }),
                    onError: (errors) => applyServerErrors(errors, setError),
                    onFinish: () => resolve(),
                },
            );
        });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <Input {...register('title')} placeholder="مهمة متابعة جديدة..." className="rounded-none" />
            <div className="flex gap-2">
                <Input {...register('due_at')} type="datetime-local" className="flex-1 rounded-none" />
                <Button type="submit" disabled={formState.isSubmitting} className="rounded-none">
                    إضافة
                </Button>
            </div>
            {(formState.errors.title || formState.errors.due_at) && (
                <p className="text-sm text-destructive">{formState.errors.title?.message ?? formState.errors.due_at?.message}</p>
            )}
        </form>
    );
}
