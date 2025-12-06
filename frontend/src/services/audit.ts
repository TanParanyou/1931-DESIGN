import { api } from './api';
import { ApiResponse } from '@/types';

export interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    entity_id: number;
    entity_type: string;
    details: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export const getAuditLogs = async (page: number = 1, limit: number = 10, search: string = '') => {
    return api.get<ApiResponse<AuditLog[]>>(`/audit-logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
};
