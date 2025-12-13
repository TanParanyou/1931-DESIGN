'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Edit2, Trash2, Plus, User as UserIcon, Search, Download } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useDataTable } from '@/hooks/useDataTable';
import { useCsvExport } from '@/hooks/useCsvExport';
import { useAuth } from '@/context/AuthContext';

interface User {
    id: number;
    username: string;
    email: string;
    role: { id: number; name: string };
    active: boolean;
    first_name: string;
    last_name: string;
}

export default function UsersPage() {
    const [error, setError] = useState('');
    const { user } = useAuth();
    const canManageUsers = user?.permissions?.includes('users.manage');

    // Define fetcher for server-side pagination
    const fetchUsersData = useCallback(async (params: any) => {
        try {
            const response = await api.get('/users', {
                params: {
                    page: params.page,
                    limit: params.limit,
                    search: params.search,
                    // Map sortKey if needed or send as is
                    // backend doesn't explicitly handle complex sort param in GetAllUsers yet based on my quick review,
                    // but I should send it. Actually backend GetAllUsers didn't have sort logic implemented in my plan
                    // (only offset/limit). I'll stick to offset/limit for now or add basic sort if standard.
                    // The verified backend code only handles pagination. I'll pass basic params.
                },
            });
            // Backend returns { success: true, data: User[], pagination: {...} }
            // api (lib/api) returns AxiosResponse.
            return response.data; // This matches ApiResponse<User[]>
        } catch (err: any) {
            setError(
                err.response?.data?.message || err.message || 'An error occurred fetching users'
            );
            throw err;
        }
    }, []); // No dependencies as api is imported and stable

    const {
        data: paginatedData,
        pagination,
        sort,
        onPageChange,
        onSort,
        onSearch,
        isLoading: loading,
        fetchData,
    } = useDataTable<User>({
        fetcher: fetchUsersData,
        initialPagination: { limit: 10 },
    });

    const refreshData = () => {
        fetchData();
    };

    const { downloadCsv } = useCsvExport();

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await api.delete(`/users/${id}`);
            if (response.data.success) {
                refreshData();
            } else {
                alert(response.data.message || 'Failed to delete user');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'An error occurred deleting user');
        }
    };

    const handleExport = () => {
        // Exporting current view for now (server-side export would require separate endpoint or fetching all)
        downloadCsv({
            filename: 'users_export.csv',
            headers: ['ID', 'Username', 'Email', 'Role', 'Status', 'First Name', 'Last Name'],
            data: paginatedData.map((user) => [
                user.id,
                user.username,
                user.email,
                user.role?.name || '',
                user.active ? 'Active' : 'Inactive',
                user.first_name,
                user.last_name,
            ]),
        });
    };

    const columns: Column<User>[] = [
        {
            header: 'User',
            accessorKey: 'username',
            sortable: true,
            cell: (_: any, user: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <UserIcon size={18} />
                    </div>
                    <div>
                        <div className="font-medium text-white">
                            {user.first_name} {user.last_name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            accessorKey: 'role',
            sortable: true,
            cell: (role: any) => {
                const roleName = role?.name || 'Unknown';
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            roleName === 'Super Admin'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                    >
                        {roleName}
                    </span>
                );
            },
        },
        {
            header: 'Status',
            accessorKey: 'active',
            sortable: true,
            cell: (active: any) => (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`}
                    />
                    {active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    if (canManageUsers) {
        columns.push({
            header: 'Actions',
            className: 'text-right',
            cell: (_: any, user: User) => (
                <Dropdown align="right">
                    <Link href={`/admin/users/${user.id}`}>
                        <DropdownItem icon={Edit2}>Edit</DropdownItem>
                    </Link>
                    <DropdownItem
                        icon={Trash2}
                        variant="danger"
                        onClick={() => handleDelete(user.id)}
                    >
                        Delete
                    </DropdownItem>
                </Dropdown>
            ),
        });
    }

    if (loading && !paginatedData.length) return <PageLoading text="กำลังโหลดข้อมูลผู้ใช้..." />;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        User Management
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">
                        Manage system users and their roles
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative grow sm:grow-0">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search users..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {canManageUsers && (
                            <Link
                                href="/admin/users/create"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm font-medium"
                            >
                                <Plus size={18} />
                                <span className="whitespace-nowrap">Create User</span>
                            </Link>
                        )}
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm font-medium"
                            title="Export to CSV"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={paginatedData}
                pagination={pagination}
                sorting={sort}
                onPageChange={onPageChange}
                onSort={onSort}
            />
        </div>
    );
}
