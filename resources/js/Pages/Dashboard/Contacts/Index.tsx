import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLinks } from '@/components/dashboard/PageLinks';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { PageProps } from '@/types';
import type { Contact, PaginatedResponse } from '@/types/models';

export default function ContactsIndex({
    contacts,
    filters,
}: {
    contacts: PaginatedResponse<Contact>;
    filters: { search?: string };
}) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.roles?.includes('admin');
    const [search, setSearch] = useState(filters.search ?? '');

    return (
        <DashboardLayout title="جهات الاتصال">
            <Head title="جهات الاتصال" />

            <Input
                placeholder="بحث بالاسم أو البريد أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    router.get(route('dashboard.contacts.index'), { search }, { preserveState: true, replace: true })
                }
                className="w-64 rounded-none"
            />

            <Card className="mt-6 overflow-x-auto rounded-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-start">الاسم</TableHead>
                            <TableHead className="text-start">التواصل</TableHead>
                            <TableHead className="text-start">الطلبات</TableHead>
                            <TableHead className="text-start">آخر طلب</TableHead>
                            {isAdmin && <TableHead className="text-start">الوكيل</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.data.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell>
                                    <Link href={route('dashboard.contacts.show', contact.id)} className="font-medium text-foreground hover:text-bronze-600 hover:underline">
                                        {contact.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    <div>{contact.email}</div>
                                    {contact.phone && <div>{contact.phone}</div>}
                                </TableCell>
                                <TableCell>{formatNumber(contact.leads_count ?? 0)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {contact.leads_max_created_at ? formatDateTime(contact.leads_max_created_at) : '—'}
                                </TableCell>
                                {isAdmin && <TableCell className="text-sm">{contact.agent?.name}</TableCell>}
                            </TableRow>
                        ))}
                        {contacts.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-muted-foreground">
                                    لا توجد جهات اتصال مطابقة.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <PageLinks page={contacts} />
        </DashboardLayout>
    );
}
