import { apiClient } from '@/lib/api';
import { PagedResponse } from '../types';

export interface CatalogItemDto {
    id: number;
    itemId: number;
    itemName: string;
    itemDescription: string;
    make: string;
    modelName: string;
    categoryId: number;
    categoryName: string;
    subCategoryId?: number;
    subCategoryName?: string;
    vendorId: number;
    vendorName: string;
    price: number;
    currency: string;
    uomId?: number;
    uomName?: string;
    contractId?: number;
    contractNumber?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    isActive: boolean;
}

interface SearchCatalogParams {
    query?: string;
    categoryId?: number;
    page?: number;
    size?: number;
}

export const catalogApi = {
    search: async (params: SearchCatalogParams) => {
        const { data } = await apiClient.get<PagedResponse<CatalogItemDto>>(
            '/master/catalog/search',
            { params }
        );
        return data;
    },
};
