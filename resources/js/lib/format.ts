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

const leadStatusLabels: Record<string, string> = {
    new: 'جديد',
    contacted: 'تم التواصل',
    closed: 'مغلق',
};

export function leadStatusLabel(status: string): string {
    return leadStatusLabels[status] ?? status;
}

const roleLabels: Record<string, string> = {
    admin: 'مدير',
    agent: 'وكيل',
    client: 'عميل',
};

export function roleLabel(role: string): string {
    return roleLabels[role] ?? role;
}
