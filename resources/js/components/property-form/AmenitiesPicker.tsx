import { Checkbox } from '@/components/ui/checkbox';
import type { Amenity } from '@/types/models';

export function AmenitiesPicker({
    amenities,
    selected,
    onChange,
}: {
    amenities: Amenity[];
    selected: number[];
    onChange: (ids: number[]) => void;
}) {
    const toggle = (id: number) => {
        onChange(selected.includes(id) ? selected.filter((a) => a !== id) : [...selected, id]);
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenities.map((amenity) => (
                <label
                    key={amenity.id}
                    className="flex items-center gap-2 border border-border px-3 py-2 text-sm hover:border-onyx-400"
                >
                    <Checkbox checked={selected.includes(amenity.id)} onCheckedChange={() => toggle(amenity.id)} />
                    {amenity.name}
                </label>
            ))}
        </div>
    );
}
