import { useState, useMemo, useCallback, useEffect } from 'react';

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

export interface FetcherParams {
    page: number;
    limit: number;
    search: string;
    sortKey: string | null;
    sortOrder: SortOrder;
}

export interface UseDataTableOptions<T> {
    data?: T[];
    initialPagination?: Partial<PaginationState>;
    initialSort?: SortState;
    initialLimit?: number;
    fetcher?: (params: FetcherParams) => Promise<{ data: T[]; total: number }>;
}

export function useDataTable<T extends Record<string, any>>({
    data = [],
    initialPagination = { page: 1, limit: 10, totalPages: 0, totalItems: 0 },
    initialSort = { key: null, order: 'asc' },
    initialLimit = 10,
    fetcher,
}: UseDataTableOptions<T>) {
    // State
    const [localData, setLocalData] = useState<T[]>(data);
    const [page, setPage] = useState(initialPagination.page || 1);
    const [limit, setLimit] = useState(initialLimit || initialPagination.limit || 10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState<SortState>(initialSort);
    const [isLoading, setIsLoading] = useState(!!fetcher);
    const [totalItems, setTotalItems] = useState(initialPagination.totalItems || 0);

    // Fetch Data (Server-side)
    const fetchData = useCallback(async () => {
        if (!fetcher) return;

        setIsLoading(true);
        try {
            const result = await fetcher({
                page,
                limit,
                search: searchQuery,
                sortKey: sort.key,
                sortOrder: sort.order,
            });

            // result is now expected to be ApiResponse<T[]> (or { data: T[], total: number } if legacy adapter used)
            // But since we updated api.ts to return ApiResponse, we strictly expect that structure if using api.ts.
            // However, fetcher definition in hook is generic (params) => Promise<{ data: T[]; total: number }>;
            // We need to support the new structure.

            // Allow fetcher to return ApiResponse like object
            // @ts-ignore
            if (result.pagination) {
                // @ts-ignore
                setLocalData(result.data || []);
                // @ts-ignore
                setTotalItems(result.pagination.total_items);
            } else {
                // Legacy fallback support if fetcher manually constructs old format
                // @ts-ignore
                setLocalData(result.data || []);
                // @ts-ignore
                setTotalItems(result.total);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, page, limit, searchQuery, sort]);

    // Initial Fetch
    useEffect(() => {
        if (fetcher) {
            fetchData();
        }
    }, [fetchData]); // Dependencies handled by useCallback

    // Client-side Filtering & Sorting
    const processedData = useMemo(() => {
        if (fetcher) return localData; // Server-side handles this

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
    }, [data, localData, searchQuery, sort, fetcher]);

    // Client-side Pagination
    const displayedData = useMemo(() => {
        if (fetcher) return localData; // Server-side handles pagination

        const start = (page - 1) * limit;
        const end = start + limit;
        return processedData.slice(start, end);
    }, [processedData, page, limit, fetcher, localData]);

    // Calculations
    const finalTotalItems = fetcher ? totalItems : processedData.length;
    const totalPages = Math.ceil(finalTotalItems / limit);

    // Handlers
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPage(1);
    }, []);

    const handleSort = useCallback((key: string) => {
        setSort((prev) => {
            const isSameKey = prev.key === key;
            const newOrder: SortOrder = isSameKey && prev.order === 'asc' ? 'desc' : 'asc';
            return { key, order: newOrder };
        });
    }, []);

    return {
        data: displayedData,
        pagination: {
            page,
            limit,
            totalPages: totalPages || 1,
            totalItems: finalTotalItems,
        },
        sort,
        searchQuery,
        isLoading,
        onPageChange: handlePageChange, // For backward compatibility / DataTable component
        onLimitChange: handleLimitChange,
        onSearch: handleSearch, // Compatible naming
        onSort: handleSort, // Compatible naming
        // Aliases for easier usage in components
        handlePageChange,
        handleLimitChange,
        handleSearch,
        handleSort,
        fetchData,
        setData: setLocalData,
        setPagination: (p: Partial<PaginationState>) => { /* Helper if needed, mostly internal */ },
    };
}
