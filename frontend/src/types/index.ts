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

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
