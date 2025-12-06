export interface News {
    id: number;
    title: string;
    category: string;
    date: string;
    image: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}

export interface Career {
    id: number;
    title: string;
    type: string;
    location: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    responsibilities?: string[];
    requirements?: string[];
}

export interface Contact {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface PaginationMetadata {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    pagination?: PaginationMetadata;
    filters?: any;
    message?: string;
    error?: {
        code?: string;
        message?: string;
        details?: string;
    };
}
