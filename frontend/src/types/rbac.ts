export interface Permission {
    id: number;
    slug: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    description: string;
    permissions?: Permission[];
    created_at: string;
    updated_at: string;
}

export interface CreateRoleInput {
    name: string;
    description: string;
}

export interface UpdateRoleInput {
    name?: string;
    description?: string;
    permission_ids?: number[];
}

export interface Menu {
    id: number;
    title: string;
    path: string;
    icon: string;
    permission_slug: string;
    parent_id?: number;
    order: number;
    is_active: boolean;
    children?: Menu[];
    created_at: string;
    updated_at: string;
}

export interface CreateMenuInput {
    title: string;
    path: string;
    icon: string;
    permission_slug: string;
    parent_id?: number;
    order: number;
}

export interface UpdateMenuInput {
    title?: string;
    path?: string;
    icon?: string;
    permission_slug?: string;
    parent_id?: number;
    order?: number;
    is_active?: boolean;
}
