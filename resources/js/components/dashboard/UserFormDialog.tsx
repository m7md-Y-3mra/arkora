import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { applyServerErrors } from '@/lib/inertia-form';
import type { User, UserRole } from '@/types/models';

const schema = z.object({
    name: z.string().min(2, 'الاسم مطلوب'),
    email: z.email('صيغة البريد الإلكتروني غير صحيحة'),
    phone: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(['admin', 'agent', 'client']),
});

type FormValues = z.infer<typeof schema>;

export function UserFormDialog({
    open,
    onOpenChange,
    user,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}) {
    const isEdit = !!user;
    const [processing, setProcessing] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', email: '', phone: '', password: '', role: 'client' },
    });

    useEffect(() => {
        if (open) {
            reset({
                name: user?.name ?? '',
                email: user?.email ?? '',
                phone: user?.phone ?? '',
                password: '',
                role: (user?.roles?.[0]?.name as UserRole) ?? 'client',
            });
        }
    }, [open, user, reset]);

    const onSubmit = (values: FormValues) => {
        if (!isEdit && !values.password) {
            setError('password', { message: 'كلمة المرور مطلوبة' });
            return;
        }

        setProcessing(true);
        const onDone = () => {
            setProcessing(false);
            onOpenChange(false);
        };

        if (isEdit) {
            router.put(route('dashboard.users.update', user!.id), values, {
                onError: (serverErrors) => {
                    applyServerErrors(serverErrors as Record<string, string>, setError);
                    setProcessing(false);
                },
                onSuccess: onDone,
            });
        } else {
            router.post(route('dashboard.users.store'), values, {
                onError: (serverErrors) => {
                    applyServerErrors(serverErrors as Record<string, string>, setError);
                    setProcessing(false);
                },
                onSuccess: onDone,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user_name">الاسم الكامل</Label>
                        <Input id="user_name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user_email">البريد الإلكتروني</Label>
                        <Input id="user_email" type="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user_phone">رقم الهاتف</Label>
                        <Input id="user_phone" {...register('phone')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user_password">
                            {isEdit ? 'كلمة المرور (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور'}
                        </Label>
                        <Input id="user_password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>الدور</Label>
                        <Select value={watch('role')} onValueChange={(v) => setValue('role', v as UserRole)}>
                            <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">مدير</SelectItem>
                                <SelectItem value="agent">وكيل</SelectItem>
                                <SelectItem value="client">عميل</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" disabled={processing} className="w-full rounded-none bg-onyx-900 hover:bg-onyx-800">
                        {isEdit ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
