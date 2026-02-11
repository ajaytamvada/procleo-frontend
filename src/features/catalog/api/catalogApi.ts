import { apiClient } from '@/lib/api';
import type { CatalogProduct, CatalogSearchParams, PagedResponse } from '../types';

export const catalogApi = {
    search: async (params: CatalogSearchParams): Promise<PagedResponse<CatalogProduct>> => {
        const { data } = await apiClient.get<PagedResponse<CatalogProduct>>(
            '/master/catalog/search',
            { params }
        );
        return data;
    },

    getById: async (id: number): Promise<CatalogProduct> => {
        const { data } = await apiClient.get<CatalogProduct>(`/master/catalog/${id}`);
        return data;
    },

    create: async (product: Partial<CatalogProduct>): Promise<CatalogProduct> => {
        const { data } = await apiClient.post<CatalogProduct>('/master/catalog', product);
        return data;
    },

    update: async (id: number, product: Partial<CatalogProduct>): Promise<CatalogProduct> => {
        const { data } = await apiClient.put<CatalogProduct>(`/master/catalog/${id}`, product);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/master/catalog/${id}`);
    },

    toggleActive: async (id: number): Promise<CatalogProduct> => {
        const { data } = await apiClient.patch<CatalogProduct>(`/master/catalog/${id}/toggle`);
        return data;
    },

    getCategories: async (): Promise<string[]> => {
        const { data } = await apiClient.get<string[]>('/master/catalog/categories');
        return data;
    },

    getVendors: async (): Promise<string[]> => {
        const { data } = await apiClient.get<string[]>('/master/catalog/vendors');
        return data;
    },
};
