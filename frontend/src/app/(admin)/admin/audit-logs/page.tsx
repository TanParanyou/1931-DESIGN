'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAuditLogs, AuditLog } from '@/services/audit';
import { RefreshCw, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FetcherParams, useDataTable } from '@/hooks/useDataTable';

export default function AuditLogsPage() {
    const {
        data: logs,
        pagination,
        sort,
        isLoading,
        searchQuery,
        handlePageChange,
        handleSort,
        handleSearch,
        fetchData,
    } = useDataTable<AuditLog>({
        initialLimit: 10,
        initialSort: { key: 'created_at', order: 'desc' },
        fetcher: useCallback(async (params: FetcherParams) => {
            const response = await getAuditLogs(params.page, params.limit, params.search);
            return {
                data: response.data || [],
                total: response.pagination?.total_items || 0,
            };
        }, []),
    });

    const columns: Column<AuditLog>[] = [
        {
            header: 'Time',
            accessorKey: 'created_at',
            sortable: false,
            cell: (value) => (
                <span className="text-gray-300">
                    {format(new Date(value), 'MMM d, yyyy HH:mm:ss')}
                </span>
            ),
        },
        {
            header: 'Action',
            accessorKey: 'action',
            sortable: false,
            cell: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${value.includes('DELETE') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    value.includes('UPDATE') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        value.includes('CREATE') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                    {value}
                </span>
            ),
        },
        {
            header: 'User ID',
            accessorKey: 'user_id',
            sortable: false,
            className: 'font-mono text-white',
        },
        {
            header: 'Entity',
            cell: (_, row) => (
                <div className="flex items-center gap-2">
                    <span className="capitalize text-gray-300">{row.entity_type}</span>
                    <span className="text-xs text-gray-500">#{row.entity_id}</span>
                </div>
            ),
        },
        {
            header: 'Details',
            accessorKey: 'details',
            cell: (value) => (
                <div className="max-w-xs truncate text-gray-400" title={value}>
                    {value}
                </div>
            ),
        },
        {
            header: 'IP Address',
            accessorKey: 'ip_address',
            className: 'font-mono text-xs',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Audit Logs
                    </h1>
                    <p className="text-gray-400 mt-1">Track system activities and user actions</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all"
                    />
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={logs}
                pagination={pagination}
                sorting={sort}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onSort={handleSort}
            />
        </div>
    );
}
