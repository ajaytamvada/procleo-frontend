import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';

interface UseCatalogSearchParams {
    query?: string;
    categoryId?: number;
    page?: number;
    size?: number;
    enabled?: boolean;
}

export const useCatalogSearch = ({
    query,
    categoryId,
    page = 0,
    size = 10,
    enabled = true,
}: UseCatalogSearchParams) => {
    return useQuery({
        queryKey: ['catalog', 'search', { query, categoryId, page, size }],
        queryFn: () => catalogApi.search({ query, categoryId, page, size }),
        placeholderData: keepPreviousData,
        enabled,
    });
};
