import { Head, Link, usePage } from '@inertiajs/react';
import { AlarmClockOff, Building2, Eye, FileCheck2, MessageSquareText, Target } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { LeadStageBadge } from '@/components/crm/LeadStage';
import { isOverdue } from '@/components/crm/TaskList';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatNumber, formatPrice, leadStatusLabel, propertyTypeLabel, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import type { Lead, LeadStatus, LeadTask, Property } from '@/types/models';

interface Stats {
    total_properties: number;
    active_listings: number;
    total_views: number;
    draft_properties: number;
}

interface TrendPoint {
    date: string;
    count: number;
}

interface TypeCount {
    type: string;
    count: number;
}

interface StageCount {
    stage: LeadStatus;
    count: number;
}

export default function Overview({
    stats,
    newLeadsCount,
    recentLeads,
    recentProperties,
    leadsTrend,
    propertyTypeCounts,
    pipelineCounts,
    conversionRate,
    overdueTasksCount,
    upcomingTasks,
}: {
    stats: Stats;
    newLeadsCount: number;
    recentLeads: Lead[];
    recentProperties: Property[];
    leadsTrend: TrendPoint[];
    propertyTypeCounts: TypeCount[];
    pipelineCounts: StageCount[];
    conversionRate: number | null;
    overdueTasksCount: number;
    upcomingTasks: LeadTask[];
}) {
    const { auth } = usePage<PageProps>().props;
    const canManage = auth.roles?.some((r) => r === 'admin' || r === 'agent');

    if (!canManage) {
        return (
            <DashboardLayout title="نظرة عامة">
                <Head title="نظرة عامة" />
                <Card className="rounded-sm">
                    <CardContent className="p-10 text-center">
                        <h2 className="font-heading text-2xl text-foreground">مرحباً {auth.user?.name}</h2>
                        <p className="mt-3 text-muted-foreground">
                            يمكنك تصفح العقارات والتواصل مع الوكلاء من الصفحة الرئيسية، أو تحديث
                            معلوماتك الشخصية من هنا.
                        </p>
                        <Link href={route('search')} className="mt-6 inline-block text-bronze-600 hover:underline">
                            تصفح العقارات ←
                        </Link>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    const trendData = leadsTrend.map((point) => ({
        ...point,
        label: new Date(point.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }),
    }));

    const typeData = propertyTypeCounts.map((row) => ({
        ...row,
        label: propertyTypeLabel(row.type),
    }));

    const pipelineData = pipelineCounts.map((row) => ({
        ...row,
        label: leadStatusLabel(row.stage),
    }));

    return (
        <DashboardLayout title="نظرة عامة">
            <Head title="نظرة عامة" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="إجمالي العقارات" value={formatNumber(stats.total_properties)} icon={Building2} />
                <StatCard label="العقارات المنشورة" value={formatNumber(stats.active_listings)} icon={FileCheck2} accent />
                <StatCard label="إجمالي المشاهدات" value={formatNumber(stats.total_views)} icon={Eye} />
                <StatCard label="طلبات جديدة" value={formatNumber(newLeadsCount)} icon={MessageSquareText} accent />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <Card className="rounded-sm lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading text-xl text-foreground">العملاء حسب المرحلة</h2>
                            <Link href={route('dashboard.leads.board')} className="text-sm text-bronze-600 hover:underline">
                                لوحة المراحل
                            </Link>
                        </div>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipelineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="label" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis allowDecimals={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{ fontSize: 12, borderRadius: 0, direction: 'rtl' }}
                                        formatter={(value) => [value, 'عميل']}
                                    />
                                    <Bar dataKey="count" fill="#B59A7A" radius={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6">
                    <StatCard
                        label="نسبة التحويل (فوز من المغلق)"
                        value={conversionRate === null ? '—' : `${formatNumber(conversionRate)}٪`}
                        icon={Target}
                    />
                    <Link href={route('dashboard.tasks.index', { bucket: 'overdue' })}>
                        <StatCard
                            label="مهام متأخرة"
                            value={formatNumber(overdueTasksCount)}
                            icon={AlarmClockOff}
                            accent={overdueTasksCount > 0}
                        />
                    </Link>
                </div>
            </div>

            <Card className="mt-8 rounded-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-heading text-xl text-foreground">المهام القادمة</h2>
                        <Link href={route('dashboard.tasks.index')} className="text-sm text-bronze-600 hover:underline">
                            كل المهام
                        </Link>
                    </div>
                    <div className="mt-4">
                        {upcomingTasks.map((task) => (
                            <Link
                                key={task.id}
                                href={route('dashboard.leads.show', task.lead_id)}
                                className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 hover:bg-muted/40"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                                    <p className="text-xs text-muted-foreground">{task.lead?.name}</p>
                                </div>
                                <span className={cn('shrink-0 text-xs text-muted-foreground', isOverdue(task) && 'font-medium text-destructive')}>
                                    {formatDateTime(task.due_at)}
                                </span>
                            </Link>
                        ))}
                        {upcomingTasks.length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">لا توجد مهام مفتوحة.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card className="rounded-sm">
                    <CardContent className="p-6">
                        <h2 className="font-heading text-xl text-foreground">طلبات التواصل خلال ١٤ يوماً</h2>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="label" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis allowDecimals={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{ fontSize: 12, borderRadius: 0, direction: 'rtl' }}
                                        labelFormatter={(label) => `${label}`}
                                        formatter={(value) => [value, 'طلبات']}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#B59A7A" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-sm">
                    <CardContent className="p-6">
                        <h2 className="font-heading text-xl text-foreground">توزيع العقارات حسب النوع</h2>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="label" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis allowDecimals={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip
                                        contentStyle={{ fontSize: 12, borderRadius: 0, direction: 'rtl' }}
                                        formatter={(value) => [value, 'عقار']}
                                    />
                                    <Bar dataKey="count" fill="#0F172A" radius={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card className="rounded-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading text-xl text-foreground">أحدث العقارات</h2>
                            <Link href={route('dashboard.properties.index')} className="text-sm text-bronze-600 hover:underline">
                                عرض الكل
                            </Link>
                        </div>

                        <div className="mt-4 space-y-4">
                            {recentProperties.map((property) => (
                                <div key={property.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                                    <div>
                                        <p className="font-medium text-foreground">{property.title}</p>
                                        <p className="text-sm text-muted-foreground">{formatPrice(property.price)}</p>
                                    </div>
                                    <Badge variant="outline" className="rounded-none">{statusLabel(property.status)}</Badge>
                                </div>
                            ))}
                            {recentProperties.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">لا توجد عقارات بعد.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading text-xl text-foreground">أحدث طلبات التواصل</h2>
                            <Link href={route('dashboard.leads.index')} className="text-sm text-bronze-600 hover:underline">
                                عرض الكل
                            </Link>
                        </div>

                        <div className="mt-4 space-y-4">
                            {recentLeads.map((lead) => (
                                <Link
                                    key={lead.id}
                                    href={route('dashboard.leads.show', lead.id)}
                                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">{lead.name}</p>
                                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                                    </div>
                                    <LeadStageBadge status={lead.status} />
                                </Link>
                            ))}
                            {recentLeads.length === 0 && (
                                <p className="py-6 text-center text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
