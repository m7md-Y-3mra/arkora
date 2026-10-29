import { router } from '@inertiajs/react';
import type { PaginatedResponse } from '@/types/models';

export function PageLinks({ page }: { page: PaginatedResponse<unknown> }) {
    if (page.last_page <= 1) return null;

    return (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
            {page.links.map((link, index) => (
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
    );
}
