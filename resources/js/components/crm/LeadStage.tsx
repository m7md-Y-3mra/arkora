import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LEAD_STAGES, leadStageBadgeClass, leadStatusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/models';

export function LeadStageBadge({ status, className }: { status: LeadStatus; className?: string }) {
    return (
        <Badge variant="outline" className={cn('rounded-none', leadStageBadgeClass[status], className)}>
            {leadStatusLabel(status)}
        </Badge>
    );
}

export function updateLeadStage(lead: Pick<Lead, 'id'>, status: LeadStatus, onError?: () => void) {
    router.patch(route('dashboard.leads.update-status', lead.id), { status }, { preserveScroll: true, onError });
}

export function LeadStageSelect({ lead, className }: { lead: Pick<Lead, 'id' | 'status'>; className?: string }) {
    return (
        <Select value={lead.status} onValueChange={(v) => updateLeadStage(lead, v as LeadStatus)}>
            <SelectTrigger className={cn('w-44 rounded-none', className)}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {LEAD_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                        {leadStatusLabel(stage)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
