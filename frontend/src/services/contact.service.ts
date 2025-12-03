import { api } from './api';
import { Contact } from '@/types';

export const ContactService = {
    submit: (data: Contact) => api.post<void>('/contact', data),
};
