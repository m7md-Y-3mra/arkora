import { Head, Link } from '@inertiajs/react';
import { Phone, Briefcase, RotateCcw } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/common/SearchInput';
import { FilterSelect } from '@/components/common/FilterSelect';
import { Pagination } from '@/components/common/Pagination';
import { useServerFilters } from '@/hooks/useServerFilters';
import type { PaginatedResponse, Property, User } from '@/types/models';

interface AgentWithStats extends User {
    properties_count: number;
    properties: Property[];
}

interface Filters {
    search?: string;
    city?: string;
    min_experience?: string;
    sort?: string;
    [key: string]: string | undefined;
}

interface AgentsProps {
    agents: PaginatedResponse<AgentWithStats>;
    filters: Filters;
    cities: string[];
}

const experienceOptions = [1, 3, 5, 10].map((years) => ({
    value: String(years),
    label: `${years}+ سنوات`,
}));

const sortOptions = [
    { value: 'listings', label: 'الأكثر عقارات' },
    { value: 'experience', label: 'الأكثر خبرة' },
    { value: 'name', label: 'الاسم' },
];

export default function Agents({ agents, filters, cities }: AgentsProps) {
    const { values, setFilter, reset, hasActive } = useServerFilters('agents.index', filters);

    return (
        <PublicLayout>
            <Head title="دليل الوكلاء العقاريين" />

            <div className="container py-16">
                <p className="font-heading text-bronze-600">شبكة أركورا</p>
                <h1 className="mt-2 font-heading text-4xl text-foreground">دليل الوكلاء العقاريين</h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                    تعرف على وكلائنا المعتمدين وتصفح أحدث العقارات المدرجة من
                    كل وكيل.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-border py-4">
                    <SearchInput
                        value={values.search ?? ''}
                        onSearch={(v) => setFilter('search', v)}
                        placeholder="ابحث باسم الوكيل أو الوكالة..."
                        className="w-full sm:w-72"
                    />
                    <FilterSelect
                        value={values.city ?? ''}
                        onChange={(v) => setFilter('city', v)}
                        options={cities.map((city) => ({ value: city, label: city }))}
                        allLabel="جميع المدن"
                        placeholder="المدينة"
                    />
                    <FilterSelect
                        value={values.min_experience ?? ''}
                        onChange={(v) => setFilter('min_experience', v)}
                        options={experienceOptions}
                        allLabel="أي خبرة"
                        placeholder="الخبرة"
                    />
                    <FilterSelect
                        value={values.sort || 'listings'}
                        onChange={(v) => setFilter('sort', v === 'listings' ? '' : v)}
                        options={sortOptions}
                        placeholder="الترتيب"
                    />
                    {hasActive && (
                        <Button variant="ghost" onClick={reset} className="rounded-none">
                            <RotateCcw className="h-4 w-4" />
                            إعادة تعيين
                        </Button>
                    )}
                    <p className="ms-auto text-sm text-muted-foreground">{agents.total} وكيل</p>
                </div>

                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.data.map((agent) => (
                        <Card key={agent.id} className="rounded-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-onyx-900 font-heading text-xl text-alabaster">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <Link
                                            href={route('agents.show', agent.id)}
                                            className="font-heading text-lg text-foreground hover:text-bronze-600"
                                        >
                                            {agent.name}
                                        </Link>
                                        {agent.agent_profile?.agency_name && (
                                            <p className="text-sm text-muted-foreground">
                                                {agent.agent_profile.agency_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {agent.agent_profile?.years_experience ?? 0} سنوات خبرة
                                    </span>
                                    {agent.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {agent.phone}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <Badge variant="outline" className="rounded-none">
                                        {agent.properties_count} عقار منشور
                                    </Badge>
                                </div>

                                {agent.properties.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {agent.properties.map((property) => {
                                            const cover = property.images?.find((img) => img.is_cover) ?? property.images?.[0];
                                            return (
                                                <Link
                                                    key={property.id}
                                                    href={route('properties.show', property.slug)}
                                                    className="aspect-square overflow-hidden bg-onyx-100"
                                                >
                                                    {cover && (
                                                        <img src={cover.url} alt={property.title} className="h-full w-full object-cover" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {agents.data.length === 0 && (
                    <div className="mt-10 text-center text-muted-foreground">
                        <p>{hasActive ? 'لا يوجد وكلاء مطابقون لبحثك.' : 'لا يوجد وكلاء متاحون حالياً.'}</p>
                        {hasActive && (
                            <Button variant="link" onClick={reset} className="mt-2 text-bronze-600">
                                عرض جميع الوكلاء
                            </Button>
                        )}
                    </div>
                )}

                <Pagination page={agents} showSummary />
            </div>
        </PublicLayout>
    );
}
