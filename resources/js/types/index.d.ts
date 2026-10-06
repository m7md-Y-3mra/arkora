import type { User, UserRole } from './models';

export interface PageProps {
    auth: {
        user: User | null;
        roles: UserRole[];
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}
