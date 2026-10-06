import type { User, UserRole } from './models';

export interface AppNotification {
    id: string;
    data: {
        lead_id: number;
        property_id: number | null;
        property_title: string | null;
        name: string;
        message: string;
    };
    read_at: string | null;
    created_at: string;
}

export interface PageProps {
    auth: {
        user: User | null;
        roles: UserRole[];
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    notifications: {
        unread_count: number;
        recent: AppNotification[];
    };
    [key: string]: unknown;
}
