import { useState, useMemo, useCallback } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface SortState {
    key: string | null;
    order: SortOrder;
}

export interface PaginationState {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

export interface UseDataTableOptions<T> {
    data: T[];
    initialPagination?: Partial<PaginationState>;
    initialSort?: SortState;
}

export function useDataTable<T extends Record<string, any>>({
    data,
    initialPagination = { page: 1, limit: 10 },
    initialSort = { key: null, order: 'asc' },
}: UseDataTableOptions<T>) {
    // State
    const [page, setPage] = useState(initialPagination.page || 1);
    const [limit, setLimit] = useState(initialPagination.limit || 10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState<SortState>(initialSort);

    // Handlers
    const onPageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const onLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when limit changes
    }, []);

    const onSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPage(1); // Reset to first page when search changes
    }, []);

    const onSort = useCallback((key: string) => {
        setSort((prev) => {
            const isSameKey = prev.key === key;
            const newOrder: SortOrder = isSameKey && prev.order === 'asc' ? 'desc' : 'asc';
            return { key, order: newOrder };
        });
    }, []);

    // Filtering & Sorting Logic
    const processedData = useMemo(() => {
        let result = [...data];

        // 1. Search (basic string matching across all values)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter((item) =>
                Object.values(item).some((value) =>
                    String(value).toLowerCase().includes(lowerQuery)
                )
            );
        }

        // 2. Sorting
        if (sort.key) {
            result.sort((a, b) => {
                const valA = a[sort.key!];
                const valB = b[sort.key!];

                if (valA < valB) return sort.order === 'asc' ? -1 : 1;
                if (valA > valB) return sort.order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchQuery, sort]);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return processedData.slice(start, end);
    }, [processedData, page, limit]);

    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        data: paginatedData,
        pagination: {
            page,
            limit,
            totalPages,
            totalItems,
        },
        sort,
        searchQuery,
        onPageChange,
        onLimitChange,
        onSearch,
        onSort,
    };
}
