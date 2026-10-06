import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { UserFormDialog } from '@/components/dashboard/UserFormDialog';
import { roleLabel } from '@/lib/format';
import type { PaginatedResponse, User } from '@/types/models';

interface Filters {
    search?: string;
    role?: string;
}

export default function UsersIndex({
    users,
    filters,
}: {
    users: PaginatedResponse<User>;
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    const updateQuery = (next: Partial<Filters>) => {
        router.get(route('dashboard.users.index'), { ...filters, ...next }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openCreate = () => {
        setEditingUser(null);
        setDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('dashboard.users.destroy', deleteTarget.id), {
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <DashboardLayout title="المستخدمون">
            <Head title="المستخدمون" />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="بحث بالاسم أو البريد..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateQuery({ search })}
                        className="w-64 rounded-none"
                    />
                    <Select value={filters.role || 'all'} onValueChange={(v) => updateQuery({ role: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-40 rounded-none">
                            <SelectValue placeholder="الدور" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الأدوار</SelectItem>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="agent">وكيل</SelectItem>
                            <SelectItem value="client">عميل</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={openCreate} className="rounded-none bg-onyx-900 hover:bg-onyx-800">
                    <Plus className="h-4 w-4" />
                    إضافة مستخدم
                </Button>
            </div>

            <div className="mt-6 overflow-x-auto border border-border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>الاسم</TableHead>
                            <TableHead>البريد الإلكتروني</TableHead>
                            <TableHead>الهاتف</TableHead>
                            <TableHead>الدور</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone ?? '—'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="rounded-none">
                                        {user.roles?.[0] ? roleLabel(user.roles[0].name) : '—'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => openEdit(user)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(user)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                    لا يوجد مستخدمون مطابقون.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {users.last_page > 1 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {users.links.map((link, index) => (
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

            <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} />

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف "{deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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
