import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Property } from '@/types/models';

export default function Home({ featuredProperties }: { featuredProperties: Property[] }) {
    const [purpose, setPurpose] = useState('sale');
    const [type, setType] = useState<string>('');
    const [city, setCity] = useState<string>('');

    const submitQuickSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(route('search'), {
            purpose,
            ...(type ? { type } : {}),
            ...(city ? { city } : {}),
        });
    };

    return (
        <PublicLayout>
            <Head title="أركورا | منصة العقارات الفاخرة" />

            <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-onyx-900">
                <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-900/70 to-transparent" />

                <div className="container relative z-10 py-24">
                    <p className="font-heading text-bronze-400">أركورا للعقارات الفاخرة</p>
                    <h1 className="mt-4 max-w-2xl font-heading text-5xl leading-tight text-alabaster sm:text-6xl">
                        اكتشف منزل أحلامك وسط أرقى العقارات
                    </h1>
                    <p className="mt-6 max-w-lg text-lg text-onyx-200">
                        نقدم لك مجموعة مختارة بعناية من العقارات السكنية
                        والتجارية في أفخم المواقع، بإدارة وكلاء معتمدين.
                    </p>

                    <form
                        onSubmit={submitQuickSearch}
                        className="mt-10 grid gap-3 border border-onyx-700 bg-background/95 p-4 backdrop-blur sm:grid-cols-4"
                    >
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder="الغرض" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sale">للبيع</SelectItem>
                                <SelectItem value="rent">للإيجار</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder="نوع العقار" />
                            </SelectTrigger>
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

                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder="المدينة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="الرياض">الرياض</SelectItem>
                                <SelectItem value="جدة">جدة</SelectItem>
                                <SelectItem value="الدمام">الدمام</SelectItem>
                                <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
                                <SelectItem value="الخبر">الخبر</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button type="submit" className="rounded-none bg-bronze-500 text-onyx-900 hover:bg-bronze-600">
                            <SearchIcon className="h-4 w-4" />
                            بحث
                        </Button>
                    </form>
                </div>
            </section>

            <section className="container py-24">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="font-heading text-bronze-600">مختارات أركورا</p>
                        <h2 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">عقارات مميزة</h2>
                    </div>
                    <Link href={route('search')} className="text-sm font-medium text-bronze-600 hover:underline">
                        عرض جميع العقارات ←
                    </Link>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredProperties.map((property, index) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            className={index === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''}
                        />
                    ))}
                </div>

                {featuredProperties.length === 0 && (
                    <p className="mt-10 text-center text-muted-foreground">لا توجد عقارات مميزة حالياً.</p>
                )}
            </section>

            <section className="bg-onyx-900 py-20 text-alabaster">
                <div className="container grid gap-10 text-center sm:grid-cols-3">
                    <div>
                        <p className="font-heading text-5xl text-bronze-400">+500</p>
                        <p className="mt-2 text-onyx-200">عقار متاح</p>
                    </div>
                    <div>
                        <p className="font-heading text-5xl text-bronze-400">+120</p>
                        <p className="mt-2 text-onyx-200">وكيل معتمد</p>
                    </div>
                    <div>
                        <p className="font-heading text-5xl text-bronze-400">+15</p>
                        <p className="mt-2 text-onyx-200">مدينة مغطاة</p>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
