import { apiHelpers as api } from '@/lib/api';
import { Career } from '@/types';

export const CareerService = {
    getAll: () => api.get<Career[]>('/careers'),
    getById: (id: number) => api.get<Career>(`/careers/${id}`),
};
