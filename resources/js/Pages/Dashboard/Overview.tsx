import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, Eye, FileCheck2, MessageSquareText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPrice, leadStatusLabel, statusLabel } from '@/lib/format';
import type { PageProps } from '@/types';
import type { Lead, Property } from '@/types/models';

interface Stats {
    total_properties: number;
    active_listings: number;
    total_views: number;
    draft_properties: number;
}

export default function Overview({
    stats,
    newLeadsCount,
    recentLeads,
    recentProperties,
}: {
    stats: Stats;
    newLeadsCount: number;
    recentLeads: Lead[];
    recentProperties: Property[];
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

    return (
        <DashboardLayout title="نظرة عامة">
            <Head title="نظرة عامة" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="إجمالي العقارات" value={formatNumber(stats.total_properties)} icon={Building2} />
                <StatCard label="العقارات المنشورة" value={formatNumber(stats.active_listings)} icon={FileCheck2} accent />
                <StatCard label="إجمالي المشاهدات" value={formatNumber(stats.total_views)} icon={Eye} />
                <StatCard label="طلبات جديدة" value={formatNumber(newLeadsCount)} icon={MessageSquareText} accent />
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
                                <div key={lead.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                                    <div>
                                        <p className="font-medium text-foreground">{lead.name}</p>
                                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                                    </div>
                                    <Badge variant="outline" className="rounded-none">{leadStatusLabel(lead.status)}</Badge>
                                </div>
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
