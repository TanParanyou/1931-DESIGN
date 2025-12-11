import api from '../lib/api';
import { Setting, UpdateSettingInput } from '../types/setting';

export const settingService = {
    getAllSettings: async () => {
        const response = await api.get<Setting[]>('/settings');
        return response.data;
    },

    updateSettings: async (settings: UpdateSettingInput[]) => {
        const response = await api.put<{ message: string }>('/settings', settings);
        return response.data;
    },

    getPublicSettings: async () => {
        const response = await api.get<Record<string, string>>('/public/settings');
        return response.data;
    },

    getPublicSettingsServer: async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8080/api';
            const response = await fetch(`${apiUrl}/api/public/settings`, {
                next: { revalidate: 60 },
            });
            if (!response.ok) return null;
            return (await response.json()) as Record<string, string>;
        } catch (error) {
            console.error('Failed to fetch settings on server', error);
            return null;
        }
    },
};
