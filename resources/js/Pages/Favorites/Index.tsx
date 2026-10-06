import { Head, Link, router } from '@inertiajs/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PropertyCard } from '@/components/property/PropertyCard';
import type { PaginatedResponse, Property } from '@/types/models';

export default function FavoritesIndex({ properties }: { properties: PaginatedResponse<Property> }) {
    return (
        <DashboardLayout title="العقارات المحفوظة">
            <Head title="العقارات المحفوظة" />

            {properties.data.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-muted-foreground">لم تقم بحفظ أي عقارات بعد.</p>
                    <Link href={route('search')} className="mt-4 inline-block text-bronze-600 hover:underline">
                        تصفح العقارات ←
                    </Link>
                </div>
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
                                link.active ? 'border-onyx-900 bg-onyx-900 text-alabaster' : 'border-border hover:border-onyx-400'
                            } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
