import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DeleteUserForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const destroy = () => {
        router.delete(route('profile.destroy'), {
            data: { password },
            onError: (errors) => setError((errors as Record<string, string>).password ?? 'حدث خطأ'),
        });
    };

    return (
        <section>
            <h2 className="font-heading text-xl text-destructive">حذف الحساب</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                بعد حذف حسابك سيتم حذف جميع بياناتك نهائيًا. يرجى تنزيل أي
                معلومات تريد الاحتفاظ بها قبل حذف الحساب.
            </p>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="mt-6 rounded-none">
                        حذف الحساب
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف حسابك؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. أدخل كلمة المرور للتأكيد.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="delete_password">كلمة المرور</Label>
                        <Input
                            id="delete_password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={destroy} className="bg-destructive hover:bg-destructive/90">
                            حذف الحساب نهائيًا
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
