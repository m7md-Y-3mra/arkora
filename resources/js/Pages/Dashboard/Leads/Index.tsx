import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { leadStatusLabel } from '@/lib/format';
import type { Lead, LeadStatus, PaginatedResponse } from '@/types/models';

interface Filters {
    search?: string;
    status?: string;
}

const statusVariant: Record<LeadStatus, string> = {
    new: 'bg-bronze-500/15 text-bronze-700 border-bronze-400',
    contacted: 'bg-blue-500/10 text-blue-700 border-blue-300',
    closed: 'bg-muted text-muted-foreground border-border',
};

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

    const updateStatus = (lead: Lead, status: LeadStatus) => {
        router.patch(route('dashboard.leads.update-status', lead.id), { status }, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="طلبات التواصل">
            <Head title="طلبات التواصل" />

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
                        <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الحالات</SelectItem>
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="contacted">تم التواصل</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-6 space-y-4">
                {leads.data.map((lead) => (
                    <Card key={lead.id} className="rounded-sm">
                        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-medium text-foreground">{lead.name}</h3>
                                    <Badge variant="outline" className={`rounded-none ${statusVariant[lead.status]}`}>
                                        {leadStatusLabel(lead.status)}
                                    </Badge>
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

                                <p className="mt-3 text-sm leading-6 text-foreground">{lead.message}</p>
                            </div>

                            <Select value={lead.status} onValueChange={(v) => updateStatus(lead, v as LeadStatus)}>
                                <SelectTrigger className="w-40 rounded-none">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">جديد</SelectItem>
                                    <SelectItem value="contacted">تم التواصل</SelectItem>
                                    <SelectItem value="closed">مغلق</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                ))}

                {leads.data.length === 0 && (
                    <p className="py-16 text-center text-muted-foreground">لا توجد طلبات تواصل مطابقة.</p>
                )}
            </div>

            {leads.last_page > 1 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {leads.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                            className={`min-w-10 border px-3 py-2 text-sm ${
                                link.active ? 'border-onyx-900 bg-onyx-900 text-alabaster' : 'border-border hover:border-onyx-400'
                            } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
