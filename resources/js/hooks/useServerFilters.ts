import { router } from '@inertiajs/react';

export type FilterValues = Record<string, string | undefined>;

/**
 * Keeps a page's filters in the query string and reloads Inertia props on change.
 * The `page` param is never carried over, so any filter change goes back to page 1.
 */
export function useServerFilters<T extends FilterValues>(routeName: string, serverFilters: T) {
    // Laravel serializes an empty filter array as `[]`, which would expose Array methods like `sort`.
    const filters = (Array.isArray(serverFilters) ? {} : serverFilters) as T;

    const visit = (next: FilterValues) => {
        const query = Object.fromEntries(
            Object.entries(next).filter(([key, value]) => key !== 'page' && value !== undefined && value !== ''),
        );

        router.get(route(routeName), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setFilter = (key: keyof T & string, value: string) => {
        if ((filters[key] ?? '') === value) return;
        visit({ ...filters, [key]: value });
    };

    const reset = () => visit({});

    const hasActive = Object.entries(filters).some(([key, value]) => key !== 'sort' && !!value);

    return { values: filters, setFilter, reset, hasActive };
}
