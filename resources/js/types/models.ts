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
    images?: PropertyImage[];
    amenities?: Amenity[];
    agent?: User;
}

export type LeadStatus = 'new' | 'contacted' | 'closed';

export interface Lead {
    id: number;
    property_id: number | null;
    agent_id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: LeadStatus;
    created_at: string;
    property?: Property | null;
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
