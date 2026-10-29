import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ActivityComposer } from '@/components/crm/ActivityComposer';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { LeadStageBadge, LeadStageSelect } from '@/components/crm/LeadStage';
import { TaskForm, TaskRow } from '@/components/crm/TaskList';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/format';
import type { Lead, User } from '@/types/models';

export default function LeadShow({
    lead,
    agents,
    canAssign,
}: {
    lead: Lead;
    agents: Pick<User, 'id' | 'name'>[];
    canAssign: boolean;
}) {
    const tasks = lead.tasks ?? [];
    const openTasks = tasks.filter((t) => !t.completed_at);
    const doneTasks = tasks.filter((t) => t.completed_at);

    const assign = (agentId: string) => {
        router.patch(route('dashboard.leads.assign', lead.id), { agent_id: Number(agentId) }, { preserveScroll: true });
    };

    return (
        <DashboardLayout title={lead.name}>
            <Head title={lead.name} />

            <Link href={route('dashboard.leads.index')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowRight className="h-4 w-4" /> العودة إلى العملاء المحتملين
            </Link>

            <Card className="mt-4 rounded-sm">
                <CardContent className="flex flex-wrap items-start justify-between gap-6 p-6">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="font-heading text-2xl text-foreground">{lead.name}</h2>
                            <LeadStageBadge status={lead.status} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-foreground">
                                <Mail className="h-3.5 w-3.5" /> {lead.email}
                            </a>
                            {lead.phone && (
                                <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-foreground">
                                    <Phone className="h-3.5 w-3.5" /> {lead.phone}
                                </a>
                            )}
                            {lead.contact && (
                                <Link href={route('dashboard.contacts.show', lead.contact.id)} className="flex items-center gap-1 text-bronze-600 hover:underline">
                                    <UserRound className="h-3.5 w-3.5" /> ملف جهة الاتصال
                                </Link>
                            )}
                        </div>
                        {lead.property && (
                            <Link href={route('properties.show', lead.property.slug)} className="flex items-center gap-1 text-sm text-bronze-600 hover:underline">
                                <Building2 className="h-3.5 w-3.5" /> {lead.property.title}
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {lead.property.city}، {lead.property.district}
                                </span>
                            </Link>
                        )}
                        <p className="text-xs text-muted-foreground">وصل في {formatDateTime(lead.created_at)}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">المرحلة</p>
                            <LeadStageSelect lead={lead} />
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">الوكيل المسؤول</p>
                            {canAssign ? (
                                <Select value={String(lead.agent_id)} onValueChange={assign}>
                                    <SelectTrigger className="w-44 rounded-none">
                                        <SelectValue placeholder={lead.agent?.name} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={String(agent.id)}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-foreground">{lead.agent?.name}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card className="rounded-sm">
                        <CardContent className="p-6">
                            <h3 className="font-heading text-lg text-foreground">رسالة العميل</h3>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground">{lead.message}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-sm">
                        <CardContent className="space-y-6 p-6">
                            <h3 className="font-heading text-lg text-foreground">سجل النشاط</h3>
                            <ActivityComposer leadId={lead.id} />
                            <ActivityTimeline activities={lead.activities ?? []} />
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit rounded-sm">
                    <CardContent className="p-6">
                        <h3 className="font-heading text-lg text-foreground">مهام المتابعة</h3>
                        <div className="mt-4">
                            <TaskForm leadId={lead.id} />
                        </div>
                        <div className="mt-4">
                            {openTasks.map((task) => (
                                <TaskRow key={task.id} task={task} />
                            ))}
                            {openTasks.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">لا توجد مهام مفتوحة.</p>}
                        </div>
                        {doneTasks.length > 0 && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-muted-foreground">المهام المنجزة ({doneTasks.length})</summary>
                                {doneTasks.map((task) => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </details>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
