'use client';

import { useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Edit2, Plus, Briefcase, Search } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useDataTable } from '@/hooks/useDataTable';

interface Employee {
    id: number;
    user_id: number;
    position: string;
    department: string;
    start_date: string;
    status: string;
    salary: number;
    user?: {
        first_name: string;
        last_name: string;
        username: string;
        email: string;
    };
}

export default function EmployeesPage() {
    const fetchEmployees = useCallback(async (params: any) => {
        try {
            const response = await api.get('/hr/employees', { params });
            // Adapt if response structure is nested differently, but handler returns {data: [], meta: {}}
            // response.data is { data: [], meta: {} }
            // DataTable hook usually expects { data: [], pagination: {} } or similar.
            // Check useDataTable generic.
            // In UsersPage: return response.data; matches {data: User[], pagination: ...}
            // My handler returns {data: Employees[], meta: {page, limit, total}}
            // I might need to adapt "meta" to "pagination" or useDataTable handles it.
            // Let's check useDataTable later or assume standard.
            // If handler returns "meta", I might need to map it.
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const {
        data: paginatedData,
        pagination,
        sort,
        onPageChange,
        onSort,
        onSearch,
        isLoading: loading,
    } = useDataTable<Employee>({
        fetcher: fetchEmployees,
        initialPagination: { limit: 10 },
    });

    const columns: Column<Employee>[] = [
        {
            header: 'Employee',
            accessorKey: 'user' as any, // Cast to any to allow nested path or custom accessor
            cell: (_: any, emp: Employee) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <div className="font-medium text-white">
                            {emp.user?.first_name} {emp.user?.last_name || emp.user?.username}
                        </div>
                        <div className="text-sm text-gray-500">{emp.position}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Department',
            accessorKey: 'department',
            sortable: true,
            cell: (dept: string) => <span className="text-gray-300">{dept}</span>,
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (status: string) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : status === 'Probation'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                    }`}
                >
                    {status}
                </span>
            ),
        },
        {
            header: 'Joined',
            accessorKey: 'start_date',
            cell: (date: string) => (
                <span className="text-gray-400">{new Date(date).toLocaleDateString()}</span>
            ),
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (_: any, emp: Employee) => (
                <Dropdown align="right">
                    <Link href={`/admin/employees/${emp.id}`}>
                        <DropdownItem icon={Edit2}>Edit</DropdownItem>
                    </Link>
                </Dropdown>
            ),
        },
    ];

    if (loading && !paginatedData.length) return <PageLoading text="กำลังโหลดข้อมูลพนักงาน..." />;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        Employee Management
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">
                        Manage employee records, contracts, and status.
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
                            placeholder="Search employees..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                    </div>

                    <Link
                        href="/admin/employees/create"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm font-medium"
                    >
                        <Plus size={18} />
                        <span className="whitespace-nowrap">Add Employee</span>
                    </Link>
                </div>
            </div>

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
