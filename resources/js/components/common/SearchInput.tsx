import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value: string;
    onSearch: (value: string) => void;
    placeholder?: string;
    debounce?: number;
    className?: string;
}

export function SearchInput({ value, onSearch, placeholder = 'بحث...', debounce = 400, className }: SearchInputProps) {
    const [term, setTerm] = useState(value);
    const onSearchRef = useRef(onSearch);
    onSearchRef.current = onSearch;

    useEffect(() => setTerm(value), [value]);

    useEffect(() => {
        if (term === value) return;
        const timeout = setTimeout(() => onSearchRef.current(term.trim()), debounce);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term, debounce]);

    return (
        <div className={cn('relative', className)}>
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchRef.current(term.trim())}
                placeholder={placeholder}
                className="rounded-none pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {term && (
                <button
                    type="button"
                    onClick={() => {
                        setTerm('');
                        onSearchRef.current('');
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="مسح البحث"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
