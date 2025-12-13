import api from '../lib/api';
import {
    Role,
    Permission,
    CreateRoleInput,
    UpdateRoleInput,
    Menu,
    CreateMenuInput,
    UpdateMenuInput,
} from '../types/rbac';

export const rbacService = {
    getRoles: async () => {
        const response = await api.get<any>('/roles');
        return response.data.data;
    },

    getRole: async (id: number) => {
        const response = await api.get<any>(`/roles/${id}`);
        return response.data.data;
    },

    createRole: async (data: CreateRoleInput) => {
        const response = await api.post<any>('/roles', data);
        return response.data.data;
    },

    updateRole: async (id: number, data: UpdateRoleInput) => {
        const response = await api.put<any>(`/roles/${id}`, data);
        return response.data.data;
    },

    deleteRole: async (id: number) => {
        const response = await api.delete<any>(`/roles/${id}`);
        return response.data.data;
    },

    getPermissions: async () => {
        const response = await api.get<any>('/permissions');
        return response.data.data;
    },

    getRoleUsers: async (id: number) => {
        const response = await api.get<any>(`/roles/${id}/users`);
        return response.data.data;
    },

    // Menu Management
    getAllMenus: async () => {
        const response = await api.get<any>('/menus');
        return response.data.data;
    },

    getMenu: async (id: number) => {
        const response = await api.get<any>(`/menus/${id}`);
        return response.data.data;
    },

    createMenu: async (data: CreateMenuInput) => {
        const response = await api.post<any>('/menus', data);
        return response.data.data;
    },

    updateMenu: async (id: number, data: UpdateMenuInput) => {
        const response = await api.put<any>(`/menus/${id}`, data);
        return response.data.data;
    },

    deleteMenu: async (id: number) => {
        const response = await api.delete<any>(`/menus/${id}`);
        return response.data.data;
    },
};
