import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AmenitiesPicker } from '@/components/property-form/AmenitiesPicker';
import { ImageManager, imagesFromExisting, type ImageItem } from '@/components/property-form/ImageManager';
import { applyServerErrors } from '@/lib/inertia-form';
import { cn } from '@/lib/utils';
import type { Amenity, Property } from '@/types/models';

const schema = z.object({
    title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
    description: z.string().min(20, 'الوصف يجب أن يكون 20 حرفاً على الأقل'),
    type: z.enum(['apartment', 'villa', 'townhouse', 'land', 'office', 'shop', 'building']),
    purpose: z.enum(['sale', 'rent']),
    status: z.enum(['draft', 'published', 'archived', 'sold', 'rented']),
    agent_id: z.string().optional(),
    price: z.string().min(1, 'السعر مطلوب').refine((v) => Number(v) > 0, 'السعر يجب أن يكون أكبر من صفر'),
    area_sqm: z.string().min(1, 'المساحة مطلوبة').refine((v) => Number(v) > 0, 'المساحة يجب أن تكون أكبر من صفر'),
    bedrooms: z.string().min(1).refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'قيمة غير صحيحة'),
    bathrooms: z.string().min(1).refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'قيمة غير صحيحة'),
    floor: z.string().optional(),
    year_built: z.string().optional(),
    city: z.string().min(1, 'المدينة مطلوبة'),
    district: z.string().min(1, 'الحي مطلوب'),
    address_line: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    is_featured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const steps = [
    { key: 'basics', label: 'الأساسيات', fields: ['title', 'description', 'type', 'purpose', 'status', 'agent_id'] },
    { key: 'details', label: 'التفاصيل والسعر', fields: ['price', 'area_sqm', 'bedrooms', 'bathrooms', 'floor', 'year_built'] },
    { key: 'location', label: 'الموقع', fields: ['city', 'district', 'address_line', 'latitude', 'longitude'] },
    { key: 'media', label: 'الصور والمرافق', fields: [] },
] as const;

export default function PropertyForm({
    property,
    amenities,
    agents,
}: {
    property: Property | null;
    amenities: Amenity[];
    agents: { id: number; name: string }[];
}) {
    const isEdit = !!property;
    const [step, setStep] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
        property?.amenities?.map((a) => a.id) ?? [],
    );
    const [images, setImages] = useState<ImageItem[]>(
        property?.images ? imagesFromExisting(property.images) : [],
    );

    const {
        register,
        handleSubmit,
        trigger,
        setValue,
        watch,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: property
            ? {
                  title: property.title,
                  description: property.description,
                  type: property.type,
                  purpose: property.purpose,
                  status: property.status,
                  agent_id: String(property.agent_id),
                  price: String(property.price),
                  area_sqm: String(property.area_sqm),
                  bedrooms: String(property.bedrooms),
                  bathrooms: String(property.bathrooms),
                  floor: property.floor != null ? String(property.floor) : '',
                  year_built: property.year_built != null ? String(property.year_built) : '',
                  city: property.city,
                  district: property.district,
                  address_line: property.address_line ?? '',
                  latitude: property.latitude ?? '',
                  longitude: property.longitude ?? '',
                  is_featured: property.is_featured,
              }
            : {
                  title: '',
                  description: '',
                  type: 'apartment',
                  purpose: 'sale',
                  status: 'draft',
                  is_featured: false,
                  price: '',
                  area_sqm: '',
                  bedrooms: '0',
                  bathrooms: '0',
                  city: '',
                  district: '',
              },
    });

    const goNext = async () => {
        const fields = steps[step].fields as unknown as (keyof FormValues)[];
        const valid = await trigger(fields);
        if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
    };

    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    const onSubmit = (values: FormValues) => {
        setProcessing(true);

        const existingItems = images.filter((i) => i.kind === 'existing');
        const newItems = images.filter((i) => i.kind === 'new');
        const coverIndex = images.findIndex((i) => i.isCover);
        const coverItem = images[coverIndex];

        const payload: Record<string, unknown> = {
            ...values,
            amenities: selectedAmenities,
        };

        if (isEdit) {
            payload.existing_images = existingItems.map((item, index) => ({
                id: item.id,
                sort_order: index,
                is_cover: item.isCover,
            }));
            payload.new_images = newItems.map((item) => item.file);
            if (coverItem) {
                payload.cover_key =
                    coverItem.kind === 'existing'
                        ? `existing:${coverItem.id}`
                        : `new:${newItems.findIndex((i) => i.key === coverItem.key)}`;
            }

            router.post(route('dashboard.properties.update', property!.id), { ...payload, _method: 'put' } as never, {
                forceFormData: true,
                onError: (serverErrors) => {
                    applyServerErrors(serverErrors as Record<string, string>, setError);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            payload.images = newItems.map((item) => item.file);
            if (coverItem) {
                payload.cover_index = newItems.findIndex((i) => i.key === coverItem.key);
            }

            router.post(route('dashboard.properties.store'), payload as never, {
                forceFormData: true,
                onError: (serverErrors) => {
                    applyServerErrors(serverErrors as Record<string, string>, setError);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    return (
        <DashboardLayout title={isEdit ? 'تعديل العقار' : 'إضافة عقار جديد'}>
            <Head title={isEdit ? 'تعديل العقار' : 'إضافة عقار جديد'} />

            <div className="mb-8 flex items-center gap-2">
                {steps.map((s, index) => (
                    <div key={s.key} className="flex flex-1 items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setStep(index)}
                            className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                index === step
                                    ? 'border-onyx-900 bg-onyx-900 text-alabaster'
                                    : index < step
                                      ? 'border-bronze-500 bg-bronze-500 text-onyx-900'
                                      : 'border-border text-muted-foreground',
                            )}
                        >
                            {index < step ? <Check className="h-4 w-4" /> : index + 1}
                        </button>
                        <span className={cn('hidden text-sm sm:block', index === step ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                            {s.label}
                        </span>
                        {index < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="border border-border bg-background p-6">
                {step === 0 && (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">عنوان العقار</Label>
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">الوصف</Label>
                            <Textarea id="description" rows={5} {...register('description')} />
                            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>نوع العقار</Label>
                                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as FormValues['type'])}>
                                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                                    <SelectContent>
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

                            <div className="space-y-2">
                                <Label>الغرض</Label>
                                <Select value={watch('purpose')} onValueChange={(v) => setValue('purpose', v as FormValues['purpose'])}>
                                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sale">للبيع</SelectItem>
                                        <SelectItem value="rent">للإيجار</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>الحالة</Label>
                                <Select value={watch('status')} onValueChange={(v) => setValue('status', v as FormValues['status'])}>
                                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">مسودة</SelectItem>
                                        <SelectItem value="published">منشور</SelectItem>
                                        <SelectItem value="archived">مؤرشف</SelectItem>
                                        <SelectItem value="sold">مباع</SelectItem>
                                        <SelectItem value="rented">مؤجر</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {agents.length > 0 && (
                            <div className="space-y-2">
                                <Label>الوكيل المسؤول</Label>
                                <Select value={watch('agent_id')} onValueChange={(v) => setValue('agent_id', v)}>
                                    <SelectTrigger className="rounded-none"><SelectValue placeholder="اختر وكيلاً" /></SelectTrigger>
                                    <SelectContent>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={String(agent.id)}>{agent.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <label className="flex items-center gap-3 border border-border px-4 py-3">
                            <Switch checked={watch('is_featured')} onCheckedChange={(v) => setValue('is_featured', v)} />
                            <span className="text-sm text-foreground">عقار مميز (يظهر في الصفحة الرئيسية)</span>
                        </label>
                    </div>
                )}

                {step === 1 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="price">السعر (ريال)</Label>
                            <Input id="price" type="number" {...register('price')} />
                            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="area_sqm">المساحة (م²)</Label>
                            <Input id="area_sqm" type="number" {...register('area_sqm')} />
                            {errors.area_sqm && <p className="text-sm text-destructive">{errors.area_sqm.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bedrooms">غرف النوم</Label>
                            <Input id="bedrooms" type="number" {...register('bedrooms')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bathrooms">الحمامات</Label>
                            <Input id="bathrooms" type="number" {...register('bathrooms')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="floor">الطابق (اختياري)</Label>
                            <Input id="floor" type="number" {...register('floor')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year_built">سنة البناء (اختياري)</Label>
                            <Input id="year_built" type="number" {...register('year_built')} />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="city">المدينة</Label>
                            <Input id="city" {...register('city')} />
                            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">الحي</Label>
                            <Input id="district" {...register('district')} />
                            {errors.district && <p className="text-sm text-destructive">{errors.district.message}</p>}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="address_line">العنوان التفصيلي (اختياري)</Label>
                            <Input id="address_line" {...register('address_line')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="latitude">خط العرض (اختياري)</Label>
                            <Input id="latitude" type="number" step="any" {...register('latitude')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">خط الطول (اختياري)</Label>
                            <Input id="longitude" type="number" step="any" {...register('longitude')} />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-3 font-heading text-lg text-foreground">صور العقار</h3>
                            <ImageManager items={images} onChange={setImages} />
                        </div>

                        <div>
                            <h3 className="mb-3 font-heading text-lg text-foreground">المرافق</h3>
                            <AmenitiesPicker amenities={amenities} selected={selectedAmenities} onChange={setSelectedAmenities} />
                        </div>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                    <Button type="button" variant="outline" className="rounded-none" onClick={goBack} disabled={step === 0}>
                        السابق
                    </Button>

                    {step < steps.length - 1 ? (
                        <Button type="button" className="rounded-none bg-onyx-900 hover:bg-onyx-800" onClick={goNext}>
                            التالي
                        </Button>
                    ) : (
                        <Button type="submit" disabled={processing} className="rounded-none bg-onyx-900 hover:bg-onyx-800">
                            {isEdit ? 'حفظ التغييرات' : 'نشر العقار'}
                        </Button>
                    )}
                </div>
            </form>
        </DashboardLayout>
    );
}
