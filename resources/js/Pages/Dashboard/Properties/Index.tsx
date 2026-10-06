import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    flexRender,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatPrice, propertyTypeLabel, purposeLabel, statusLabel } from '@/lib/format';
import type { PaginatedResponse, Property } from '@/types/models';

interface Filters {
    search?: string;
    status?: string;
    purpose?: string;
    sort_by?: string;
    sort_dir?: string;
}

const columnHelper = createColumnHelper<Property>();

export default function PropertiesIndex({
    properties,
    filters,
}: {
    properties: PaginatedResponse<Property>;
    filters: Filters;
}) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

    const updateQuery = (next: Partial<Filters>) => {
        router.get(route('dashboard.properties.index'), { ...filters, ...next }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const toggleSort = (column: string) => {
        const dir = filters.sort_by === column && filters.sort_dir === 'asc' ? 'desc' : 'asc';
        updateQuery({ sort_by: column, sort_dir: dir });
    };

    const sortIcon = (column: string) => {
        if (filters.sort_by !== column) return <ArrowUpDown className="h-3.5 w-3.5" />;
        return filters.sort_dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    };

    const columns = useMemo(
        () => [
            columnHelper.display({
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={selected.length === properties.data.length && properties.data.length > 0}
                        onCheckedChange={(checked) =>
                            setSelected(checked ? properties.data.map((p) => p.id) : [])
                        }
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selected.includes(row.original.id)}
                        onCheckedChange={(checked) =>
                            setSelected((prev) =>
                                checked ? [...prev, row.original.id] : prev.filter((id) => id !== row.original.id),
                            )
                        }
                    />
                ),
            }),
            columnHelper.display({
                id: 'cover',
                header: '',
                cell: ({ row }) => {
                    const cover = row.original.images?.find((i) => i.is_cover) ?? row.original.images?.[0];
                    return (
                        <div className="h-12 w-16 overflow-hidden bg-onyx-100">
                            {cover && <img src={cover.url} alt="" className="h-full w-full object-cover" />}
                        </div>
                    );
                },
            }),
            columnHelper.accessor('title', {
                header: () => (
                    <button className="flex items-center gap-1" onClick={() => toggleSort('title')}>
                        العقار {sortIcon('title')}
                    </button>
                ),
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium text-foreground">{row.original.title}</p>
                        <p className="text-xs text-muted-foreground">{row.original.district}، {row.original.city}</p>
                    </div>
                ),
            }),
            columnHelper.accessor('type', {
                header: 'النوع',
                cell: ({ getValue }) => propertyTypeLabel(getValue()),
            }),
            columnHelper.accessor('purpose', {
                header: 'الغرض',
                cell: ({ getValue }) => purposeLabel(getValue()),
            }),
            columnHelper.accessor('price', {
                header: () => (
                    <button className="flex items-center gap-1" onClick={() => toggleSort('price')}>
                        السعر {sortIcon('price')}
                    </button>
                ),
                cell: ({ getValue }) => formatPrice(getValue()),
            }),
            columnHelper.accessor('status', {
                header: 'الحالة',
                cell: ({ getValue }) => <Badge variant="outline" className="rounded-none">{statusLabel(getValue())}</Badge>,
            }),
            columnHelper.accessor('views_count', {
                header: () => (
                    <button className="flex items-center gap-1" onClick={() => toggleSort('views_count')}>
                        المشاهدات {sortIcon('views_count')}
                    </button>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button asChild size="icon" variant="ghost">
                            <Link href={route('dashboard.properties.edit', row.original.id)}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(row.original)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ),
            }),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selected, properties.data, filters.sort_by, filters.sort_dir],
    );

    const table = useReactTable({
        data: properties.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const runBulkAction = (action: 'publish' | 'archive' | 'delete') => {
        router.post(route('dashboard.properties.bulk-action'), { ids: selected, action }, {
            onSuccess: () => setSelected([]),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('dashboard.properties.destroy', deleteTarget.id), {
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <DashboardLayout title="العقارات">
            <Head title="العقارات" />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="بحث..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateQuery({ search })}
                        className="w-56 rounded-none"
                    />
                    <Select value={filters.status || 'all'} onValueChange={(v) => updateQuery({ status: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-40 rounded-none">
                            <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="draft">مسودة</SelectItem>
                            <SelectItem value="published">منشور</SelectItem>
                            <SelectItem value="archived">مؤرشف</SelectItem>
                            <SelectItem value="sold">مباع</SelectItem>
                            <SelectItem value="rented">مؤجر</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button asChild className="rounded-none bg-onyx-900 hover:bg-onyx-800">
                    <Link href={route('dashboard.properties.create')}>
                        <Plus className="h-4 w-4" />
                        إضافة عقار
                    </Link>
                </Button>
            </div>

            {selected.length > 0 && (
                <div className="mt-4 flex items-center gap-3 border border-bronze-300 bg-bronze-50 px-4 py-3">
                    <p className="text-sm font-medium text-onyx-800">{selected.length} عنصر محدد</p>
                    <Button size="sm" variant="outline" className="rounded-none" onClick={() => runBulkAction('publish')}>
                        نشر
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-none" onClick={() => runBulkAction('archive')}>
                        أرشفة
                    </Button>
                    <Button size="sm" variant="destructive" className="rounded-none" onClick={() => runBulkAction('delete')}>
                        حذف
                    </Button>
                </div>
            )}

            <div className="mt-6 overflow-x-auto border border-border bg-background">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {properties.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
                                    لا توجد عقارات مطابقة.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {properties.last_page > 1 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
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

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف العقار</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف "{deleteTarget?.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
