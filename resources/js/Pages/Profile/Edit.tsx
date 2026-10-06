import { Head } from '@inertiajs/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { UpdateProfileInformationForm } from './Partials/UpdateProfileInformationForm';
import { UpdatePasswordForm } from './Partials/UpdatePasswordForm';
import { DeleteUserForm } from './Partials/DeleteUserForm';

export default function Edit({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    return (
        <DashboardLayout title="الملف الشخصي">
            <Head title="الملف الشخصي" />

            <div className="mx-auto max-w-2xl space-y-6">
                <Card className="rounded-sm">
                    <CardContent className="p-6">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </CardContent>
                </Card>

                <Card className="rounded-sm">
                    <CardContent className="p-6">
                        <UpdatePasswordForm />
                    </CardContent>
                </Card>

                <Card className="rounded-sm border-destructive/30">
                    <CardContent className="p-6">
                        <DeleteUserForm />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
