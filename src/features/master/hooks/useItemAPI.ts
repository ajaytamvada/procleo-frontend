import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Item {
  id: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  uomId: number;
  uomName: string;
  make: string;
  modelName: string;
  displayName: string;
  code?: string;
  description?: string;
}

export interface ItemFilters {
  displayName?: string;
  code?: string;
  categoryName?: string;
  subCategoryName?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const itemAPI = {
  getAll: async (): Promise<Item[]> => {
    const response = await apiClient.get('/master/items/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: ItemFilters = {}
  ): Promise<PagedResponse<Item>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.displayName) params.append('displayName', filters.displayName);
    if (filters.code) params.append('code', filters.code);
    if (filters.categoryName)
      params.append('categoryName', filters.categoryName);
    if (filters.subCategoryName)
      params.append('subCategoryName', filters.subCategoryName);

    const response = await apiClient.get(`/master/items?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Item> => {
    const response = await apiClient.get(`/master/items/${id}`);
    return response.data;
  },

  create: async (
    item: Omit<
      Item,
      'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'
    >
  ): Promise<Item> => {
    const response = await apiClient.post('/master/items', item);
    return response.data;
  },

  update: async (
    id: number,
    item: Omit<
      Item,
      'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'
    >
  ): Promise<Item> => {
    const response = await apiClient.put(`/master/items/${id}`, item);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/items/${id}`);
  },

  exportToExcel: async (filters: ItemFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.displayName) params.append('displayName', filters.displayName);
    if (filters.code) params.append('code', filters.code);
    if (filters.categoryName)
      params.append('categoryName', filters.categoryName);
    if (filters.subCategoryName)
      params.append('subCategoryName', filters.subCategoryName);

    const response = await apiClient.get(`/master/items/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const useItems = () => {
  return useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: itemAPI.getAll,
  });
};

export const useItemsPaged = (
  page: number,
  size: number,
  filters: ItemFilters
) => {
  return useQuery<PagedResponse<Item>>({
    queryKey: ['items', 'paged', page, size, filters],
    queryFn: () => itemAPI.getPaged(page, size, filters),
  });
};

export const useItem = (id: number) => {
  return useQuery<Item>({
    queryKey: ['item', id],
    queryFn: () => itemAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: itemAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Omit<
        Item,
        'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'
      >;
    }) => itemAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: itemAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export default itemAPI;
