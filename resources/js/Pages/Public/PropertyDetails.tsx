import { Head } from '@inertiajs/react';
import {
    BedDouble,
    Bath,
    Ruler,
    MapPin,
    Calendar,
    Layers,
    Check,
    Phone,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactAgentForm } from '@/components/property/ContactAgentForm';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    formatArea,
    formatPrice,
    propertyTypeLabel,
    purposeLabel,
} from '@/lib/format';
import type { Property } from '@/types/models';

export default function PropertyDetails({ property }: { property: Property }) {
    const images = property.images ?? [];

    return (
        <PublicLayout>
            <Head title={property.title} />

            <div className="container py-10">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {property.district}، {property.city}
                        </p>
                        <h1 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">{property.title}</h1>
                    </div>
                    <div className="text-end">
                        <p className="font-heading text-3xl text-bronze-600">{formatPrice(property.price)}</p>
                        <p className="text-sm text-muted-foreground">
                            {purposeLabel(property.purpose)} · {propertyTypeLabel(property.type)}
                        </p>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:[&>*:first-child]:col-span-2 sm:[&>*:first-child]:row-span-2">
                        {images.slice(0, 5).map((image) => (
                            <Dialog key={image.id}>
                                <DialogTrigger asChild>
                                    <button className="aspect-square overflow-hidden bg-onyx-100">
                                        <img
                                            src={image.url}
                                            alt={property.title}
                                            className="h-full w-full object-cover transition-transform hover:scale-105"
                                        />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
                                    <img src={image.url} alt={property.title} className="w-full" />
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                )}

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
                    <div>
                        <div className="grid grid-cols-2 gap-4 border border-border p-6 sm:grid-cols-4">
                            <Stat icon={BedDouble} label="غرف النوم" value={String(property.bedrooms)} />
                            <Stat icon={Bath} label="الحمامات" value={String(property.bathrooms)} />
                            <Stat icon={Ruler} label="المساحة" value={formatArea(property.area_sqm)} />
                            <Stat icon={Layers} label="الطابق" value={property.floor ? String(property.floor) : '—'} />
                        </div>

                        <section className="mt-10">
                            <h2 className="font-heading text-2xl text-foreground">وصف العقار</h2>
                            <p className="mt-4 whitespace-pre-line leading-8 text-muted-foreground">
                                {property.description}
                            </p>
                        </section>

                        {property.amenities && property.amenities.length > 0 && (
                            <section className="mt-10">
                                <h2 className="font-heading text-2xl text-foreground">المرافق</h2>
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {property.amenities.map((amenity) => (
                                        <div key={amenity.id} className="flex items-center gap-2 text-sm text-foreground">
                                            <Check className="h-4 w-4 text-bronze-600" />
                                            {amenity.name}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-8 text-sm sm:grid-cols-3">
                            <div>
                                <p className="text-muted-foreground">سنة البناء</p>
                                <p className="mt-1 flex items-center gap-1 font-medium text-foreground">
                                    <Calendar className="h-4 w-4" /> {property.year_built ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">العنوان</p>
                                <p className="mt-1 font-medium text-foreground">{property.address_line ?? '—'}</p>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        {property.agent && (
                            <Card className="rounded-sm">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground">الوكيل العقاري</p>
                                    <h3 className="mt-1 font-heading text-xl text-foreground">{property.agent.name}</h3>
                                    {property.agent.agent_profile?.agency_name && (
                                        <p className="text-sm text-muted-foreground">
                                            {property.agent.agent_profile.agency_name}
                                        </p>
                                    )}
                                    {property.agent.phone && (
                                        <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
                                            <Phone className="h-4 w-4 text-bronze-600" />
                                            {property.agent.phone}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="rounded-sm">
                            <CardContent className="p-6">
                                <h3 className="mb-4 font-heading text-xl text-foreground">تواصل مع الوكيل</h3>
                                <ContactAgentForm propertyId={property.id} propertyTitle={property.title} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="text-center">
            <Icon className="mx-auto h-5 w-5 text-bronze-600" />
            <p className="mt-2 font-heading text-lg text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}
