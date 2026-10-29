import { Link } from '@inertiajs/react';
import { ArrowLeftRight, CalendarClock, GitCommitHorizontal, Mail, Phone, StickyNote, UserRoundCog } from 'lucide-react';
import { activityTypeLabel, formatDateTime, leadStatusLabel } from '@/lib/format';
import type { LeadActivity } from '@/types/models';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    note: StickyNote,
    call: Phone,
    email: Mail,
    meeting: CalendarClock,
    stage_change: ArrowLeftRight,
    assignment: UserRoundCog,
};

function describe(activity: LeadActivity): string | null {
    if (activity.type === 'stage_change' && activity.meta) {
        return `من «${leadStatusLabel(String(activity.meta.from))}» إلى «${leadStatusLabel(String(activity.meta.to))}»`;
    }
    if (activity.type === 'assignment' && activity.meta) {
        return `تم التحويل إلى ${activity.meta.to_agent_name}`;
    }

    return activity.body;
}

export function ActivityTimeline({ activities, showLead = false }: { activities: LeadActivity[]; showLead?: boolean }) {
    if (activities.length === 0) {
        return <p className="py-8 text-center text-sm text-muted-foreground">لا يوجد نشاط مسجل بعد.</p>;
    }

    return (
        <ol className="relative space-y-5 border-s border-border ps-6">
            {activities.map((activity) => {
                const Icon = icons[activity.type] ?? GitCommitHorizontal;
                return (
                    <li key={activity.id} className="relative">
                        <span className="absolute -start-[34px] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background">
                            <Icon className="h-3.5 w-3.5 text-bronze-600" />
                        </span>
                        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                            <span className="font-medium text-foreground">{activityTypeLabel(activity.type)}</span>
                            <span className="text-muted-foreground">
                                {activity.user?.name ?? 'النظام'} · {formatDateTime(activity.created_at)}
                            </span>
                        </div>
                        {showLead && activity.lead && (
                            <Link
                                href={route('dashboard.leads.show', activity.lead.id)}
                                className="text-xs text-bronze-600 hover:underline"
                            >
                                {activity.lead.property?.title ?? `طلب #${activity.lead.id}`}
                            </Link>
                        )}
                        {describe(activity) && (
                            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-foreground">{describe(activity)}</p>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
