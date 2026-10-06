import { Head, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import {
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    useQueryStates,
} from 'nuqs';
import { SlidersHorizontal } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { Amenity, PaginatedResponse, Property } from '@/types/models';

interface SearchProps {
    properties: PaginatedResponse<Property>;
    amenities: Amenity[];
    filters: Record<string, string>;
}

const filterParsers = {
    search: parseAsString.withDefault(''),
    purpose: parseAsString.withDefault(''),
    type: parseAsString.withDefault(''),
    city: parseAsString.withDefault(''),
    min_price: parseAsString.withDefault(''),
    max_price: parseAsString.withDefault(''),
    bedrooms: parseAsString.withDefault(''),
    bathrooms: parseAsString.withDefault(''),
    amenities: parseAsArrayOf(parseAsInteger).withDefault([]),
    sort: parseAsString.withDefault('latest'),
};

export default function Search({ properties, amenities }: SearchProps) {
    const [filters, setFilters] = useQueryStates(filterParsers, {
        history: 'replace',
    });
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            const query: Record<string, string | number | number[]> = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value === '' || value === null) return;
                if (Array.isArray(value) && value.length === 0) return;
                query[key] = value;
            });

            router.get(route('search'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const toggleAmenity = (id: number) => {
        setFilters((prev) => ({
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter((a) => a !== id)
                : [...prev.amenities, id],
        }));
    };

    const FiltersPanel = (
        <div className="space-y-8">
            <div>
                <Label className="mb-3 block">الغرض</Label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: '', label: 'الكل' },
                        { value: 'sale', label: 'للبيع' },
                        { value: 'rent', label: 'للإيجار' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilters({ purpose: opt.value })}
                            className={`border px-3 py-2 text-sm transition-colors ${
                                filters.purpose === opt.value
                                    ? 'border-onyx-900 bg-onyx-900 text-alabaster'
                                    : 'border-border text-foreground hover:border-onyx-400'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label className="mb-3 block">نوع العقار</Label>
                <Select value={filters.type || 'all'} onValueChange={(v) => setFilters({ type: v === 'all' ? '' : v })}>
                    <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="جميع الأنواع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="apartment">شقة</SelectItem>
                        <SelectItem value="villa">فيلا</SelectItem>
                        <SelectItem value="townhouse">تاون هاوس</SelectItem>
                        <SelectItem value="land">أرض</SelectItem>
                        <SelectItem value="office">مكتب</SelectItem>
                        <SelectItem value="shop">محل تجاري</SelectItem>
                        <SelectItem value="building">عمارة</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="mb-3 block">المدينة</Label>
                <Select value={filters.city || 'all'} onValueChange={(v) => setFilters({ city: v === 'all' ? '' : v })}>
                    <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="جميع المدن" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">جميع المدن</SelectItem>
                        <SelectItem value="الرياض">الرياض</SelectItem>
                        <SelectItem value="جدة">جدة</SelectItem>
                        <SelectItem value="الدمام">الدمام</SelectItem>
                        <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
                        <SelectItem value="الخبر">الخبر</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="mb-3 block">نطاق السعر (ريال)</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        placeholder="من"
                        value={filters.min_price}
                        onChange={(e) => setFilters({ min_price: e.target.value })}
                        className="rounded-none"
                    />
                    <Input
                        type="number"
                        placeholder="إلى"
                        value={filters.max_price}
                        onChange={(e) => setFilters({ max_price: e.target.value })}
                        className="rounded-none"
                    />
                </div>
            </div>

            <div>
                <Label className="mb-3 block">الحد الأدنى لعدد الغرف</Label>
                <Select value={filters.bedrooms || 'any'} onValueChange={(v) => setFilters({ bedrooms: v === 'any' ? '' : v })}>
                    <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="أي عدد" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">أي عدد</SelectItem>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}+ غرف</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="mb-3 block">الحد الأدنى لعدد الحمامات</Label>
                <Select value={filters.bathrooms || 'any'} onValueChange={(v) => setFilters({ bathrooms: v === 'any' ? '' : v })}>
                    <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="أي عدد" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">أي عدد</SelectItem>
                        {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}+ حمامات</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label className="mb-3 block">المرافق</Label>
                <div className="grid grid-cols-2 gap-3">
                    {amenities.map((amenity) => (
                        <label key={amenity.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={filters.amenities.includes(amenity.id)}
                                onCheckedChange={() => toggleAmenity(amenity.id)}
                            />
                            {amenity.name}
                        </label>
                    ))}
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full rounded-none"
                onClick={() =>
                    setFilters({
                        search: '',
                        purpose: '',
                        type: '',
                        city: '',
                        min_price: '',
                        max_price: '',
                        bedrooms: '',
                        bathrooms: '',
                        amenities: [],
                        sort: 'latest',
                    })
                }
            >
                إعادة تعيين الفلاتر
            </Button>
        </div>
    );

    return (
        <PublicLayout>
            <Head title="البحث عن عقار" />

            <div className="container py-12">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="font-heading text-3xl text-foreground">نتائج البحث</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {properties.total} عقار متاح
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="ابحث بالعنوان أو الحي..."
                            value={filters.search}
                            onChange={(e) => setFilters({ search: e.target.value })}
                            className="w-56 rounded-none"
                        />

                        <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
                            <SelectTrigger className="w-44 rounded-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">الأحدث</SelectItem>
                                <SelectItem value="oldest">الأقدم</SelectItem>
                                <SelectItem value="price_asc">السعر: من الأقل</SelectItem>
                                <SelectItem value="price_desc">السعر: من الأعلى</SelectItem>
                                <SelectItem value="area_desc">المساحة: الأكبر</SelectItem>
                            </SelectContent>
                        </Select>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="rounded-none lg:hidden">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    الفلاتر
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="start" className="w-80 overflow-y-auto">
                                <div className="mt-8">{FiltersPanel}</div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
                    <aside className="hidden lg:block">{FiltersPanel}</aside>

                    <div>
                        {properties.data.length === 0 ? (
                            <p className="py-20 text-center text-muted-foreground">
                                لا توجد عقارات مطابقة لبحثك. حاول تعديل الفلاتر.
                            </p>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {properties.data.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        )}

                        {properties.last_page > 1 && (
                            <div className="mt-10 flex flex-wrap justify-center gap-2">
                                {properties.links.map((link, index) => (
                                    <button
                                        key={index}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                        className={`min-w-10 border px-3 py-2 text-sm ${
                                            link.active
                                                ? 'border-onyx-900 bg-onyx-900 text-alabaster'
                                                : 'border-border text-foreground hover:border-onyx-400'
                                        } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
