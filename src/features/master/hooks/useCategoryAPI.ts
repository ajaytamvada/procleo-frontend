import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Category {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface CategoryFilters {
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

const categoryAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/master/categories/all');
    return response.data;
  },

  getPaged: async (page = 0, size = 15, filters: CategoryFilters = {}): Promise<PagedResponse<Category>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(`/master/categories?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/master/categories/${id}`);
    return response.data;
  },

  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await apiClient.post('/master/categories', category);
    return response.data;
  },

  update: async (id: number, category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await apiClient.put(`/master/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/categories/${id}`);
  },

  exportToExcel: async (filters: CategoryFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(`/master/categories/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryAPI.getAll,
  });
};

export const useCategoriesPaged = (page: number, size: number, filters: CategoryFilters) => {
  return useQuery<PagedResponse<Category>>({
    queryKey: ['categories', 'paged', page, size, filters],
    queryFn: () => categoryAPI.getPaged(page, size, filters),
  });
};

export const useCategory = (id: number) => {
  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: () => categoryAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Category, 'id'> }) =>
      categoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export default categoryAPI;
