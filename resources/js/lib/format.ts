const currencyFormatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ar-SA');

export function formatPrice(value: string | number): string {
    return currencyFormatter.format(Number(value));
}

export function formatNumber(value: string | number): string {
    return numberFormatter.format(Number(value));
}

export function formatArea(value: string | number): string {
    return `${numberFormatter.format(Number(value))} م²`;
}

const propertyTypeLabels: Record<string, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    townhouse: 'تاون هاوس',
    land: 'أرض',
    office: 'مكتب',
    shop: 'محل تجاري',
    building: 'عمارة',
};

export function propertyTypeLabel(type: string): string {
    return propertyTypeLabels[type] ?? type;
}

const purposeLabels: Record<string, string> = {
    sale: 'للبيع',
    rent: 'للإيجار',
};

export function purposeLabel(purpose: string): string {
    return purposeLabels[purpose] ?? purpose;
}

const statusLabels: Record<string, string> = {
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',
    sold: 'مباع',
    rented: 'مؤجر',
};

export function statusLabel(status: string): string {
    return statusLabels[status] ?? status;
}

export const LEAD_STAGES = ['new', 'contacted', 'viewing', 'negotiation', 'won', 'lost'] as const;

const leadStatusLabels: Record<string, string> = {
    new: 'جديد',
    contacted: 'تم التواصل',
    viewing: 'معاينة',
    negotiation: 'تفاوض',
    won: 'تم الإغلاق بنجاح',
    lost: 'خسارة',
};

export function leadStatusLabel(status: string): string {
    return leadStatusLabels[status] ?? status;
}

export const leadStageBadgeClass: Record<string, string> = {
    new: 'bg-bronze-500/15 text-bronze-700 border-bronze-400',
    contacted: 'bg-blue-500/10 text-blue-700 border-blue-300',
    viewing: 'bg-violet-500/10 text-violet-700 border-violet-300',
    negotiation: 'bg-amber-500/10 text-amber-700 border-amber-300',
    won: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    lost: 'bg-muted text-muted-foreground border-border',
};

const activityTypeLabels: Record<string, string> = {
    note: 'ملاحظة',
    call: 'مكالمة',
    email: 'بريد إلكتروني',
    meeting: 'اجتماع',
    stage_change: 'تغيير المرحلة',
    assignment: 'تحويل العميل',
};

export function activityTypeLabel(type: string): string {
    return activityTypeLabels[type] ?? type;
}

const dateTimeFormatter = new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
});

export function formatDateTime(value: string): string {
    return dateTimeFormatter.format(new Date(value));
}

const roleLabels: Record<string, string> = {
    admin: 'مدير',
    agent: 'وكيل',
    client: 'عميل',
};

export function roleLabel(role: string): string {
    return roleLabels[role] ?? role;
}
