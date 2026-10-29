import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, Phone, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/common/Pagination';
import { LeadStageBadge, LeadStageSelect } from '@/components/crm/LeadStage';
import { LeadsViewToggle } from '@/components/crm/LeadsViewToggle';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LEAD_STAGES, leadStatusLabel } from '@/lib/format';
import type { Lead, PaginatedResponse } from '@/types/models';

interface Filters {
    search?: string;
    status?: string;
    contact_id?: string;
}

export default function LeadsIndex({
    leads,
    filters,
}: {
    leads: PaginatedResponse<Lead>;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? '');

    const updateQuery = (next: Partial<Filters>) => {
        router.get(route('dashboard.leads.index'), { ...filters, ...next }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const contactName = filters.contact_id ? leads.data[0]?.contact?.name : null;

    return (
        <DashboardLayout title="العملاء المحتملون">
            <Head title="العملاء المحتملون" />

            <div className="flex flex-wrap items-center gap-3">
                <Input
                    placeholder="بحث بالاسم أو البريد أو الهاتف..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateQuery({ search })}
                    className="w-64 rounded-none"
                />
                <Select value={filters.status || 'all'} onValueChange={(v) => updateQuery({ status: v === 'all' ? '' : v })}>
                    <SelectTrigger className="w-44 rounded-none">
                        <SelectValue placeholder="المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع المراحل</SelectItem>
                        {LEAD_STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                                {leadStatusLabel(stage)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filters.contact_id && (
                    <button
                        onClick={() => updateQuery({ contact_id: '' })}
                        className="flex items-center gap-1 border border-bronze-400 bg-bronze-500/10 px-3 py-2 text-sm text-bronze-700"
                    >
                        جهة الاتصال: {contactName ?? `#${filters.contact_id}`}
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
                <div className="ms-auto">
                    <LeadsViewToggle current="list" />
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {leads.data.map((lead) => (
                    <Card key={lead.id} className="rounded-sm">
                        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('dashboard.leads.show', lead.id)}
                                        className="font-medium text-foreground hover:text-bronze-600 hover:underline"
                                    >
                                        {lead.name}
                                    </Link>
                                    <LeadStageBadge status={lead.status} />
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" /> {lead.email}
                                    </span>
                                    {lead.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" /> {lead.phone}
                                        </span>
                                    )}
                                </div>

                                {lead.property && (
                                    <Link
                                        href={route('properties.show', lead.property.slug)}
                                        className="mt-2 inline-block text-sm text-bronze-600 hover:underline"
                                    >
                                        بخصوص: {lead.property.title}
                                    </Link>
                                )}

                                <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground">{lead.message}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <LeadStageSelect lead={lead} />
                                <Link
                                    href={route('dashboard.leads.show', lead.id)}
                                    className="text-sm text-bronze-600 hover:underline"
                                >
                                    عرض التفاصيل ←
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {leads.data.length === 0 && (
                    <p className="py-16 text-center text-muted-foreground">لا توجد طلبات تواصل مطابقة.</p>
                )}
            </div>

            <Pagination page={leads} />
        </DashboardLayout>
    );
}
