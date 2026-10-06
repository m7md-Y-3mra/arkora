import { Link } from '@inertiajs/react';
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatArea, formatPrice, propertyTypeLabel, purposeLabel } from '@/lib/format';
import type { Property } from '@/types/models';

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
    const cover = property.images?.find((img) => img.is_cover) ?? property.images?.[0];

    return (
        <Link
            href={route('properties.show', property.slug)}
            className={`group block overflow-hidden border border-border bg-background transition-shadow hover:shadow-xl ${className ?? ''}`}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-onyx-100">
                {cover ? (
                    <img
                        src={cover.url}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-onyx-300">
                        <span className="font-heading text-lg">أركورا</span>
                    </div>
                )}

                <div className="absolute start-3 top-3 flex gap-2">
                    <Badge className="rounded-none bg-onyx-900 text-alabaster">{purposeLabel(property.purpose)}</Badge>
                    <Badge variant="outline" className="rounded-none border-alabaster bg-background/80 text-foreground">
                        {propertyTypeLabel(property.type)}
                    </Badge>
                </div>
            </div>

            <div className="p-5">
                <p className="font-heading text-xl text-foreground">{formatPrice(property.price)}</p>
                <h3 className="mt-2 line-clamp-1 text-base font-semibold text-foreground">{property.title}</h3>

                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {property.district}، {property.city}
                </p>

                <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" /> {formatArea(property.area_sqm)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
