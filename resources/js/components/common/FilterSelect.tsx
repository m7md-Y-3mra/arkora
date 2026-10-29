import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
    /** Adds an "all" choice that maps to an empty value. Omit for required selects like sort. */
    allLabel?: string;
    className?: string;
}

const ALL = '__all__';

export function FilterSelect({ value, onChange, options, placeholder, allLabel, className }: FilterSelectProps) {
    const current = value || (allLabel ? ALL : '');

    return (
        <Select value={current} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
            <SelectTrigger className={cn('w-44 rounded-none', className)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
