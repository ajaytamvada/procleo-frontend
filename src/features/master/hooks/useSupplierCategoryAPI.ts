import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface SupplierCategory {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface SupplierCategoryFilters {
  name?: string;
  code?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const supplierCategoryAPI = {
  getAll: async (): Promise<SupplierCategory[]> => {
    const response = await apiClient.get('/master/supplier-categories/all');
    return Array.isArray(response.data) ? response.data : [];
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: SupplierCategoryFilters = {}
  ): Promise<PagedResponse<SupplierCategory>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(
      `/master/supplier-categories?${params}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<SupplierCategory> => {
    const response = await apiClient.get(`/master/supplier-categories/${id}`);
    return response.data;
  },

  create: async (
    category: Omit<SupplierCategory, 'id'>
  ): Promise<SupplierCategory> => {
    const response = await apiClient.post(
      '/master/supplier-categories',
      category
    );
    return response.data;
  },

  update: async (
    id: number,
    category: Omit<SupplierCategory, 'id'>
  ): Promise<SupplierCategory> => {
    const response = await apiClient.put(
      `/master/supplier-categories/${id}`,
      category
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/supplier-categories/${id}`);
  },
};

export const useSupplierCategories = () => {
  return useQuery<SupplierCategory[]>({
    queryKey: ['supplier-categories'],
    queryFn: supplierCategoryAPI.getAll,
  });
};

export const useSupplierCategoriesPaged = (
  page: number,
  size: number,
  filters: SupplierCategoryFilters
) => {
  return useQuery<PagedResponse<SupplierCategory>>({
    queryKey: ['supplier-categories', 'paged', page, size, filters],
    queryFn: () => supplierCategoryAPI.getPaged(page, size, filters),
  });
};

export const useCreateSupplierCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierCategoryAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-categories'] });
    },
  });
};

export const useUpdateSupplierCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Omit<SupplierCategory, 'id'>;
    }) => supplierCategoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-categories'] });
    },
  });
};

export const useDeleteSupplierCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierCategoryAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-categories'] });
    },
  });
};

export default supplierCategoryAPI;
