const API_BASE_URL = 'http://localhost:8080/api';

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

export const api = {
    getNews: async (): Promise<News[]> => {
        try {
            const res = await fetch(`${API_BASE_URL}/news`);
            if (!res.ok) throw new Error('Failed to fetch news');
            const json: ApiResponse<News[]> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getNewsById: async (id: number): Promise<News | null> => {
        try {
            const res = await fetch(`${API_BASE_URL}/news/${id}`);
            if (!res.ok) return null;
            const json: ApiResponse<News> = await res.json();
            if (!json.success) return null;
            return json.data as News;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    getCareers: async (): Promise<Career[]> => {
        try {
            const res = await fetch(`${API_BASE_URL}/careers`);
            if (!res.ok) throw new Error('Failed to fetch careers');
            const json: ApiResponse<Career[]> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    getCareerById: async (id: number): Promise<Career | null> => {
        try {
            const res = await fetch(`${API_BASE_URL}/careers/${id}`);
            if (!res.ok) return null;
            const json: ApiResponse<Career> = await res.json();
            if (!json.success) return null;
            return json.data as Career;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    submitContact: async (data: Contact): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json: ApiResponse<any> = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to submit contact');
    }
};
