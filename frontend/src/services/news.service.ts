import { apiHelpers as api } from '@/lib/api';
import { News } from '@/types';

export const NewsService = {
    getAll: () => api.get<News[]>('/news'),
    getById: (id: number) => api.get<News>(`/news/${id}`),
};
