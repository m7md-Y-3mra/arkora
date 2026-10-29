import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { updateLeadStage } from '@/components/crm/LeadStage';
import { LeadsViewToggle } from '@/components/crm/LeadsViewToggle';
import { Input } from '@/components/ui/input';
import { LEAD_STAGES, leadStageBadgeClass, leadStatusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/models';

function LeadCardBody({ lead }: { lead: Lead }) {
    return (
        <>
            <p className="font-medium text-foreground">{lead.name}</p>
            {lead.property && (
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{lead.property.title}</span>
                </p>
            )}
            {lead.agent && <p className="mt-1 text-xs text-muted-foreground">{lead.agent.name}</p>}
        </>
    );
}

function DraggableLead({ lead }: { lead: Lead }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={cn(
                'cursor-grab touch-none border border-border bg-background p-3 shadow-sm transition-opacity active:cursor-grabbing',
                isDragging && 'opacity-30',
            )}
        >
            <LeadCardBody lead={lead} />
            <Link
                href={route('dashboard.leads.show', lead.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="mt-2 inline-block text-xs text-bronze-600 hover:underline"
            >
                فتح ←
            </Link>
        </div>
    );
}

function StageColumn({ stage, leads }: { stage: LeadStatus; leads: Lead[] }) {
    const { setNodeRef, isOver } = useDroppable({ id: stage });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex w-64 shrink-0 flex-col border border-border bg-muted/40 transition-colors',
                isOver && 'border-bronze-400 bg-bronze-500/5',
            )}
        >
            <div className={cn('flex items-center justify-between border-b px-3 py-2', leadStageBadgeClass[stage])}>
                <span className="text-sm font-medium">{leadStatusLabel(stage)}</span>
                <span className="text-xs">{leads.length}</span>
            </div>
            <div className="flex min-h-32 flex-1 flex-col gap-2 p-2">
                {leads.map((lead) => (
                    <DraggableLead key={lead.id} lead={lead} />
                ))}
            </div>
        </div>
    );
}

export default function LeadsBoard({ leads: initialLeads, filters }: { leads: Lead[]; filters: { search?: string } }) {
    const [leads, setLeads] = useState(initialLeads);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => setLeads(initialLeads), [initialLeads]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor),
    );

    const byStage = useMemo(() => {
        const groups = Object.fromEntries(LEAD_STAGES.map((s) => [s, [] as Lead[]])) as Record<LeadStatus, Lead[]>;
        leads.forEach((lead) => groups[lead.status].push(lead));
        return groups;
    }, [leads]);

    const activeLead = leads.find((l) => l.id === activeId) ?? null;

    const onDragStart = (event: DragStartEvent) => setActiveId(Number(event.active.id));

    const onDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const lead = leads.find((l) => l.id === Number(event.active.id));
        const stage = event.over?.id as LeadStatus | undefined;
        if (!lead || !stage || lead.status === stage) return;

        const previous = leads;
        setLeads((current) => current.map((l) => (l.id === lead.id ? { ...l, status: stage } : l)));
        updateLeadStage(lead, stage, () => setLeads(previous));
    };

    return (
        <DashboardLayout title="لوحة المراحل">
            <Head title="لوحة المراحل" />

            <div className="flex flex-wrap items-center gap-3">
                <Input
                    placeholder="بحث بالاسم أو البريد أو الهاتف..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        router.get(route('dashboard.leads.board'), { search }, { preserveState: true, replace: true })
                    }
                    className="w-64 rounded-none"
                />
                <p className="text-sm text-muted-foreground">اسحب البطاقة لتغيير مرحلة العميل. الصفقات المغلقة تظهر لآخر ٣٠ يوماً.</p>
                <div className="ms-auto">
                    <LeadsViewToggle current="board" />
                </div>
            </div>

            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
                <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
                    {LEAD_STAGES.map((stage) => (
                        <StageColumn key={stage} stage={stage} leads={byStage[stage]} />
                    ))}
                </div>
                <DragOverlay>
                    {activeLead && (
                        <div className="w-60 cursor-grabbing border border-bronze-400 bg-background p-3 shadow-lg">
                            <LeadCardBody lead={activeLead} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </DashboardLayout>
    );
}
