'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from 'lucide-react';
import { Loading } from './Loading';
import { cn } from '@/lib/utils';
import { SortState, PaginationState } from '@/hooks/useDataTable';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    // Custom cell renderer. If provided, accessorKey value is passed as first arg, full row as second.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cell?: (value: any, row: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    pagination?: PaginationState;
    sorting?: SortState;
    isLoading?: boolean;
    onPageChange?: (page: number) => void;
    onSort?: (key: string) => void;
    className?: string; // Additional classes for the container
    hidePagination?: boolean; // Hide pagination footer for simple tables
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    pagination,
    sorting,
    isLoading = false,
    onPageChange,
    onSort,
    className,
    hidePagination = false,
}: DataTableProps<T>) {
    const safeData = data || [];

    // Safe pagination values with fallbacks
    const page = pagination?.page || 1;
    const totalPages = pagination?.totalPages || 1;
    const limit = pagination?.limit || 10;
    const totalItems = pagination?.totalItems ?? safeData.length;

    // Default sorting state
    const sortingState = sorting || { key: null, order: 'asc' as const };

    // Pagination Helper
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(page);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={cn('w-full space-y-4', className)}>
            {/* Table Container */}
            <div className="relative w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-visible">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-gray-200">
                        {/* Header */}
                        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                {columns.map((col, idx) => {
                                    const isSortable = col.sortable && col.accessorKey && onSort;
                                    const isSorted = sortingState.key === col.accessorKey;

                                    return (
                                        <th
                                            key={idx}
                                            className={cn(
                                                'px-6 py-4 font-medium transition-colors whitespace-nowrap',
                                                isSortable && 'cursor-pointer hover:text-white',
                                                col.className
                                            )}
                                            onClick={() =>
                                                isSortable && onSort?.(col.accessorKey as string)
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.header}
                                                {isSortable && (
                                                    <ArrowUpDown
                                                        className={cn(
                                                            'h-3 w-3 transition-opacity',
                                                            isSorted
                                                                ? 'opacity-100 text-amber-500'
                                                                : 'opacity-30'
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length} className="h-48">
                                            <div className="flex items-center justify-center h-full">
                                                <Loading
                                                    variant="orbit"
                                                    size="lg"
                                                    text="กำลังโหลดข้อมูล..."
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ) : safeData.length > 0 ? (
                                    safeData.map((row, rowIdx) => (
                                        <motion.tr
                                            key={(row as { id?: string | number }).id ?? rowIdx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2, delay: rowIdx * 0.05 }}
                                            className="group transition-colors hover:bg-white/5"
                                        >
                                            {columns.map((col, colIdx) => (
                                                <td
                                                    key={colIdx}
                                                    className={cn(
                                                        'px-6 py-4 whitespace-nowrap',
                                                        col.className
                                                    )}
                                                >
                                                    {col.cell
                                                        ? col.cell(
                                                              col.accessorKey
                                                                  ? row[col.accessorKey]
                                                                  : undefined,
                                                              row
                                                          )
                                                        : col.accessorKey
                                                          ? String(row[col.accessorKey])
                                                          : null}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="h-32 text-center text-gray-400"
                                        >
                                            No data found
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                {!hidePagination && (
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 bg-white/5 px-6 py-4 gap-4">
                        <div className="text-xs text-gray-400 text-center sm:text-left">
                            {totalItems > 0 ? (
                                <>
                                    Showing{' '}
                                    <span className="text-white">{(page - 1) * limit + 1}</span> to{' '}
                                    <span className="text-white">
                                        {Math.min(page * limit, totalItems)}
                                    </span>{' '}
                                    of <span className="text-white">{totalItems}</span> entries
                                </>
                            ) : (
                                <span className="text-gray-500">No entries to display</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange?.(1)}
                                disabled={page === 1 || isLoading}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onPageChange?.(page - 1)}
                                disabled={page === 1 || isLoading}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="hidden sm:flex items-center gap-2">
                                {getPageNumbers().map((p, i) =>
                                    p === '...' ? (
                                        <span key={i} className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={i}
                                            onClick={() => onPageChange?.(p as number)}
                                            className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all',
                                                page === p
                                                    ? 'bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20'
                                                    : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>
                            {/* Mobile page indicator */}
                            <span className="sm:hidden text-sm text-gray-300 font-medium px-2">
                                {page} / {totalPages}
                            </span>

                            <button
                                onClick={() => onPageChange?.(page + 1)}
                                disabled={page === totalPages || isLoading}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onPageChange?.(totalPages)}
                                disabled={page === totalPages || isLoading}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
