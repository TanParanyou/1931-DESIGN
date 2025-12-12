export interface Project {
    id: number;
    title: string;
    location: string;
    location_map_link: string;
    owner: string;
    category: string;
    images: string[];
    description: string;
    status: string;
    sort_order: number;
    is_active: boolean;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateProjectInput {
    title: string;
    location: string;
    location_map_link?: string;
    owner?: string;
    category: string;
    images: string[];
    description?: string;
    status?: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export interface CreateCategoryInput {
    name: string;
    slug?: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface UploadResult {
    key: string;
    url: string;
    thumbnail_key: string;
    thumbnail_url: string;
}
