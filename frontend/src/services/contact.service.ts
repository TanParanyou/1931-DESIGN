import { apiHelpers as api } from '@/lib/api';
import { Contact } from '@/types';

export const ContactService = {
    submit: (data: Contact) => api.post<void>('/contact', data),
};
