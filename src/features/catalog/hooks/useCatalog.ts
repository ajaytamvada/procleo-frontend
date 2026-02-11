import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';
import type { CatalogProduct, CatalogSearchParams } from '../types';

export const useCatalogSearch = (params: CatalogSearchParams & { enabled?: boolean }) => {
    const { enabled = true, ...searchParams } = params;
    return useQuery({
        queryKey: ['catalog', 'search', searchParams],
        queryFn: () => catalogApi.search(searchParams),
        placeholderData: keepPreviousData,
        enabled,
    });
};

export const useCatalogItem = (id: number | null) => {
    return useQuery({
        queryKey: ['catalog', 'item', id],
        queryFn: () => catalogApi.getById(id!),
        enabled: !!id,
    });
};

export const useCatalogCategories = () => {
    return useQuery({
        queryKey: ['catalog', 'categories'],
        queryFn: () => catalogApi.getCategories(),
    });
};

export const useCatalogVendors = () => {
    return useQuery({
        queryKey: ['catalog', 'vendors'],
        queryFn: () => catalogApi.getVendors(),
    });
};

export const useCreateCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product: Partial<CatalogProduct>) => catalogApi.create(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog'] });
        },
    });
};

export const useUpdateCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, product }: { id: number; product: Partial<CatalogProduct> }) =>
            catalogApi.update(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog'] });
        },
    });
};

export const useDeleteCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => catalogApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog'] });
        },
    });
};

export const useToggleCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => catalogApi.toggleActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalog'] });
        },
    });
};
