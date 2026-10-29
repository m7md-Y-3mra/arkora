export type UserRole = 'admin' | 'agent' | 'client';

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_path: string | null;
    is_active: boolean;
    created_at: string;
    roles?: { id: number; name: UserRole }[];
    agent_profile?: AgentProfile | null;
}

export interface AgentProfile {
    id: number;
    user_id: number;
    agency_name: string | null;
    license_number: string | null;
    years_experience: number;
    whatsapp: string | null;
    bio: string | null;
}

export type PropertyType =
    | 'apartment'
    | 'villa'
    | 'townhouse'
    | 'land'
    | 'office'
    | 'shop'
    | 'building';

export type PropertyPurpose = 'sale' | 'rent';

export type PropertyStatus = 'draft' | 'published' | 'archived' | 'sold' | 'rented';

export interface PropertyImage {
    id: number;
    property_id: number;
    path: string;
    url: string;
    sort_order: number;
    is_cover: boolean;
}

export interface Amenity {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
}

export interface Property {
    id: number;
    agent_id: number;
    title: string;
    slug: string;
    description: string;
    type: PropertyType;
    purpose: PropertyPurpose;
    status: PropertyStatus;
    price: string;
    area_sqm: string;
    bedrooms: number;
    bathrooms: number;
    floor: number | null;
    year_built: number | null;
    city: string;
    district: string;
    address_line: string | null;
    latitude: string | null;
    longitude: string | null;
    is_featured: boolean;
    views_count: number;
    published_at: string | null;
    created_at: string;
    is_favorited?: boolean;
    images?: PropertyImage[];
    amenities?: Amenity[];
    agent?: User;
}

export type LeadStatus = 'new' | 'contacted' | 'viewing' | 'negotiation' | 'won' | 'lost';

export interface Contact {
    id: number;
    agent_id: number;
    name: string;
    email: string;
    phone: string | null;
    notes: string | null;
    created_at: string;
    leads_count?: number;
    leads_max_created_at?: string | null;
    agent?: Pick<User, 'id' | 'name'>;
    leads?: Lead[];
}

export type LeadActivityType = 'note' | 'call' | 'email' | 'meeting' | 'stage_change' | 'assignment';

export interface LeadActivity {
    id: number;
    lead_id: number;
    user_id: number | null;
    type: LeadActivityType;
    body: string | null;
    meta: Record<string, string | number | null> | null;
    created_at: string;
    user?: Pick<User, 'id' | 'name'> | null;
    lead?: Pick<Lead, 'id' | 'name' | 'property_id'> & { property?: Pick<Property, 'id' | 'title'> | null };
}

export interface LeadTask {
    id: number;
    lead_id: number;
    user_id: number;
    title: string;
    due_at: string;
    completed_at: string | null;
    created_at: string;
    user?: Pick<User, 'id' | 'name'>;
    lead?: Pick<Lead, 'id' | 'name' | 'status' | 'property_id'> & { property?: Pick<Property, 'id' | 'title'> | null };
}

export interface Lead {
    id: number;
    property_id: number | null;
    agent_id: number;
    contact_id: number | null;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: LeadStatus;
    created_at: string;
    updated_at: string;
    property?: Property | null;
    agent?: Pick<User, 'id' | 'name' | 'email'>;
    contact?: Contact | null;
    activities?: LeadActivity[];
    tasks?: LeadTask[];
}

export interface PaginatedResponse<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
