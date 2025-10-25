import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface UOM {
  id?: number;
  name: string;
  code: string;
}

export interface UOMFilters {
  name?: string;
  code?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const UOM_QUERY_KEY = ['uoms'];

// API service functions
const uomAPI = {
  getAll: async (): Promise<UOM[]> => {
    const response = await apiClient.get('/master/uoms/all');
    return response.data;
  },

  getPaged: async (page = 0, size = 15, filters: UOMFilters = {}): Promise<PagedResponse<UOM>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(`/master/uoms?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<UOM> => {
    const response = await apiClient.get(`/master/uoms/${id}`);
    return response.data;
  },

  create: async (uom: Omit<UOM, 'id'>): Promise<UOM> => {
    const response = await apiClient.post('/master/uoms', uom);
    return response.data;
  },

  update: async (id: number, uom: Omit<UOM, 'id'>): Promise<UOM> => {
    const response = await apiClient.put(`/master/uoms/${id}`, uom);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/uoms/${id}`);
  },

  exportToExcel: async (filters: UOMFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(`/master/uoms/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// React Query hooks
export const useUOMs = () => {
  return useQuery({
    queryKey: UOM_QUERY_KEY,
    queryFn: uomAPI.getAll,
  });
};

export const useUOMsPaged = (page = 0, size = 15, filters: UOMFilters = {}) => {
  return useQuery({
    queryKey: [...UOM_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => uomAPI.getPaged(page, size, filters),
  });
};

export const useUOM = (id: number) => {
  return useQuery({
    queryKey: [...UOM_QUERY_KEY, id],
    queryFn: () => uomAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateUOM = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uomAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEY });
    },
  });
};

export const useUpdateUOM = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<UOM, 'id'> }) =>
      uomAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEY });
    },
  });
};

export const useDeleteUOM = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uomAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UOM_QUERY_KEY });
    },
  });
};

export { uomAPI };
