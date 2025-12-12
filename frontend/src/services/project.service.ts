import api from '../lib/api';
import {
    Project,
    Category,
    CreateProjectInput,
    UpdateProjectInput,
    CreateCategoryInput,
    UpdateCategoryInput,
    UploadResult,
} from '../types/project';

export const projectService = {
    // Projects
    getProjects: async (page = 1, limit = 10, category?: string) => {
        const params: Record<string, any> = { page, limit };
        if (category) params.category = category;
        const response = await api.get<any>('/projects', { params });
        return response.data;
    },

    getProject: async (id: number) => {
        const response = await api.get<any>(`/projects/${id}`);
        return response.data.data;
    },

    createProject: async (data: CreateProjectInput) => {
        const response = await api.post<any>('/projects', data);
        return response.data.data;
    },

    updateProject: async (id: number, data: UpdateProjectInput) => {
        const response = await api.put<any>(`/projects/${id}`, data);
        return response.data.data;
    },

    deleteProject: async (id: number) => {
        const response = await api.delete<any>(`/projects/${id}`);
        return response.data;
    },

    updateProjectOrder: async (orderData: { id: number; sort_order: number }[]) => {
        const response = await api.put<any>('/projects/order', orderData);
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await api.get<any>('/categories');
        return response.data.data as Category[];
    },

    getAllCategories: async () => {
        const response = await api.get<any>('/categories/all');
        return response.data.data as Category[];
    },

    getCategory: async (id: number) => {
        const response = await api.get<any>(`/categories/${id}`);
        return response.data.data;
    },

    createCategory: async (data: CreateCategoryInput) => {
        const response = await api.post<any>('/categories', data);
        return response.data.data;
    },

    updateCategory: async (id: number, data: UpdateCategoryInput) => {
        const response = await api.put<any>(`/categories/${id}`, data);
        return response.data.data;
    },

    deleteCategory: async (id: number) => {
        const response = await api.delete<any>(`/categories/${id}`);
        return response.data;
    },

    updateCategoryOrder: async (orderData: { id: number; sort_order: number }[]) => {
        const response = await api.put<any>('/categories/order', orderData);
        return response.data;
    },

    // Image Upload
    uploadImage: async (file: File, folder = 'projects'): Promise<UploadResult> => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        const response = await api.post<any>('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    deleteImage: async (key: string) => {
        const response = await api.delete<any>(`/upload/image/${key}`);
        return response.data;
    },
};
