import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface SubCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  code?: string;
  assetPrefix?: string;
}

export interface SubCategoryFilters {
  name?: string;
  code?: string;
  categoryName?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const subCategoryAPI = {
  getAll: async (): Promise<SubCategory[]> => {
    const response = await apiClient.get('/master/subcategories/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: SubCategoryFilters = {}
  ): Promise<PagedResponse<SubCategory>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.categoryName)
      params.append('categoryName', filters.categoryName);

    const response = await apiClient.get(`/master/subcategories?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<SubCategory> => {
    const response = await apiClient.get(`/master/subcategories/${id}`);
    return response.data;
  },

  getByCategoryId: async (categoryId: number): Promise<SubCategory[]> => {
    const response = await apiClient.get(
      `/master/subcategories/category/${categoryId}`
    );
    return response.data;
  },

  create: async (
    subCategory: Omit<SubCategory, 'id' | 'categoryName'>
  ): Promise<SubCategory> => {
    const response = await apiClient.post('/master/subcategories', subCategory);
    return response.data;
  },

  update: async (
    id: number,
    subCategory: Omit<SubCategory, 'id' | 'categoryName'>
  ): Promise<SubCategory> => {
    const response = await apiClient.put(
      `/master/subcategories/${id}`,
      subCategory
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/subcategories/${id}`);
  },

  exportToExcel: async (filters: SubCategoryFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.categoryName)
      params.append('categoryName', filters.categoryName);

    const response = await apiClient.get(
      `/master/subcategories/export?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export const useSubCategories = () => {
  return useQuery<SubCategory[]>({
    queryKey: ['subcategories'],
    queryFn: subCategoryAPI.getAll,
  });
};

export const useSubCategoriesPaged = (
  page: number,
  size: number,
  filters: SubCategoryFilters
) => {
  return useQuery<PagedResponse<SubCategory>>({
    queryKey: ['subcategories', 'paged', page, size, filters],
    queryFn: () => subCategoryAPI.getPaged(page, size, filters),
  });
};

export const useSubCategory = (id: number) => {
  return useQuery<SubCategory>({
    queryKey: ['subcategory', id],
    queryFn: () => subCategoryAPI.getById(id),
    enabled: !!id,
  });
};

export const useSubCategoriesByCategoryId = (categoryId: number | null) => {
  return useQuery<SubCategory[]>({
    queryKey: ['subcategories', 'category', categoryId],
    queryFn: () => subCategoryAPI.getByCategoryId(categoryId!),
    enabled: !!categoryId,
  });
};

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subCategoryAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Omit<SubCategory, 'id' | 'categoryName'>;
    }) => subCategoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subCategoryAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export default subCategoryAPI;
