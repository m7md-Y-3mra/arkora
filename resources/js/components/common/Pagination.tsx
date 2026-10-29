import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginatedResponse } from '@/types/models';

interface PaginationProps {
    page: PaginatedResponse<unknown>;
    showSummary?: boolean;
}

export function Pagination({ page, showSummary = false }: PaginationProps) {
    if (page.last_page <= 1) {
        return showSummary && page.total > 0 ? <Summary page={page} /> : null;
    }

    const lastIndex = page.links.length - 1;

    return (
        <div className="mt-8 space-y-3">
            <nav aria-label="التنقل بين الصفحات" className="flex flex-wrap justify-center gap-2">
                {page.links.map((link, index) => {
                    const isPrev = index === 0;
                    const isNext = index === lastIndex;

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={!link.url}
                            aria-current={link.active ? 'page' : undefined}
                            onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                            className={`flex min-w-10 items-center justify-center gap-1 border px-3 py-2 text-sm ${
                                link.active ? 'border-onyx-900 bg-onyx-900 text-alabaster' : 'border-border hover:border-onyx-400'
                            } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                        >
                            {isPrev ? (
                                <>
                                    <ChevronRight className="h-4 w-4" />
                                    السابق
                                </>
                            ) : isNext ? (
                                <>
                                    التالي
                                    <ChevronLeft className="h-4 w-4" />
                                </>
                            ) : (
                                link.label
                            )}
                        </button>
                    );
                })}
            </nav>
            {showSummary && <Summary page={page} />}
        </div>
    );
}

function Summary({ page }: { page: PaginatedResponse<unknown> }) {
    return (
        <p className="text-center text-sm text-muted-foreground">
            عرض {page.from}–{page.to} من {page.total}
        </p>
    );
}
