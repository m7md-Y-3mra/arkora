import { Head, Link, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { LeadStageBadge } from '@/components/crm/LeadStage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/lib/format';
import { applyServerErrors } from '@/lib/inertia-form';
import type { Contact, LeadActivity } from '@/types/models';

const schema = z.object({
    name: z.string().trim().min(2, 'الاسم مطلوب'),
    phone: z.string().optional(),
    notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function ContactShow({ contact, activities }: { contact: Contact; activities: LeadActivity[] }) {
    const leads = contact.leads ?? [];

    const { register, handleSubmit, setError, formState } = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { name: contact.name, phone: contact.phone ?? '', notes: contact.notes ?? '' },
    });

    const onSubmit = (values: Values) =>
        new Promise<void>((resolve) => {
            router.put(route('dashboard.contacts.update', contact.id), values, {
                preserveScroll: true,
                onError: (errors) => applyServerErrors(errors, setError),
                onFinish: () => resolve(),
            });
        });

    return (
        <DashboardLayout title={contact.name}>
            <Head title={contact.name} />

            <Link href={route('dashboard.contacts.index')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowRight className="h-4 w-4" /> العودة إلى جهات الاتصال
            </Link>

            <div className="mt-4 grid gap-6 lg:grid-cols-3">
                <Card className="h-fit rounded-sm">
                    <CardContent className="p-6">
                        <h2 className="font-heading text-xl text-foreground">بيانات جهة الاتصال</h2>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" /> {contact.email}
                        </p>
                        {contact.agent && <p className="mt-1 text-xs text-muted-foreground">الوكيل: {contact.agent.name}</p>}

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">الاسم</Label>
                                <Input id="name" {...register('name')} className="rounded-none" />
                                {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">الهاتف</Label>
                                <Input id="phone" {...register('phone')} className="rounded-none" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="notes">ملاحظات</Label>
                                <Textarea id="notes" rows={4} {...register('notes')} placeholder="تفضيلات العميل، الميزانية، أوقات التواصل..." className="rounded-none" />
                            </div>
                            <Button type="submit" disabled={formState.isSubmitting} className="w-full rounded-none">
                                حفظ
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6 lg:col-span-2">
                    <Card className="rounded-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading text-lg text-foreground">الطلبات ({leads.length})</h3>
                                <Link href={route('dashboard.leads.index', { contact_id: contact.id })} className="text-sm text-bronze-600 hover:underline">
                                    عرض في القائمة
                                </Link>
                            </div>
                            <div className="mt-4">
                                {leads.map((lead) => (
                                    <Link
                                        key={lead.id}
                                        href={route('dashboard.leads.show', lead.id)}
                                        className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 hover:bg-muted/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">{lead.property?.title ?? 'عقار محذوف'}</p>
                                            <p className="text-xs text-muted-foreground">{formatDateTime(lead.created_at)}</p>
                                        </div>
                                        <LeadStageBadge status={lead.status} />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-sm">
                        <CardContent className="p-6">
                            <h3 className="mb-6 font-heading text-lg text-foreground">آخر النشاطات</h3>
                            <ActivityTimeline activities={activities} showLead />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
