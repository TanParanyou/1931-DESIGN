'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortState, PaginationState } from '@/hooks/useDataTable';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    // Custom cell renderer. If provided, accessorKey value is passed as first arg, full row as second.
    cell?: (value: any, row: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    pagination: PaginationState;
    sorting: SortState;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onSort: (key: string) => void;
    className?: string; // Additional classes for the container
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    pagination,
    sorting,
    isLoading = false,
    onPageChange,
    onSort,
    className,
}: DataTableProps<T>) {
    const { page, totalPages, limit, totalItems } = pagination;

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
        <div className={cn("w-full space-y-4", className)}>
            {/* Table Container */}
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl">

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-white" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-200">
                        {/* Header */}
                        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                {columns.map((col, idx) => {
                                    const isSortable = col.sortable && col.accessorKey;
                                    const isSorted = sorting.key === col.accessorKey;

                                    return (
                                        <th
                                            key={idx}
                                            className={cn(
                                                "px-6 py-4 font-medium transition-colors",
                                                isSortable && "cursor-pointer hover:text-white",
                                                col.className
                                            )}
                                            onClick={() => isSortable && onSort(col.accessorKey as string)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.header}
                                                {isSortable && (
                                                    <ArrowUpDown className={cn("h-3 w-3 transition-opacity", isSorted ? "opacity-100 text-amber-500" : "opacity-30")} />
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
                                {data.length > 0 ? (
                                    data.map((row, rowIdx) => (
                                        <motion.tr
                                            key={row.id || rowIdx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2, delay: rowIdx * 0.05 }}
                                            className="group transition-colors hover:bg-white/5"
                                        >
                                            {columns.map((col, colIdx) => (
                                                <td key={colIdx} className={cn("px-6 py-4", col.className)}>
                                                    {col.cell
                                                        ? col.cell(col.accessorKey ? row[col.accessorKey] : undefined, row)
                                                        : (col.accessorKey ? String(row[col.accessorKey]) : null)}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    !isLoading && (
                                        <tr>
                                            <td colSpan={columns.length} className="h-32 text-center text-gray-400">
                                                No data found
                                            </td>
                                        </tr>
                                    )
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-6 py-4">
                    <div className="text-xs text-gray-400">
                        Showing <span className="text-white">{Math.min((page - 1) * limit + 1, totalItems)}</span> to <span className="text-white">{Math.min(page * limit, totalItems)}</span> of <span className="text-white">{totalItems}</span> entries
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={page === 1 || isLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || isLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {getPageNumbers().map((p, i) => (
                            p === '...' ? (
                                <span key={i} className="px-2 text-gray-500">...</span>
                            ) : (
                                <button
                                    key={i}
                                    onClick={() => onPageChange(p as number)}
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-lg  text-sm transition-all",
                                        page === p
                                            ? "bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20"
                                            : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {p}
                                </button>
                            )
                        ))}

                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages || isLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={page === totalPages || isLoading}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
