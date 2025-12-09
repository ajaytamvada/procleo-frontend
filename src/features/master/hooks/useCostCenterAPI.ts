import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface CostCenter {
  id?: number;
  name: string;
  code?: string;
  departmentId: number;
  departmentName?: string;
}

export interface CostCenterFilters {
  name?: string;
  code?: string;
  departmentName?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
}

const COST_CENTER_QUERY_KEY = ['costCenters'];

// API service functions
const costCenterAPI = {
  getAll: async (): Promise<CostCenter[]> => {
    const response = await apiClient.get('/master/cost-centers/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: CostCenterFilters = {}
  ): Promise<PagedResponse<CostCenter>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.departmentName)
      params.append('departmentName', filters.departmentName);

    const response = await apiClient.get<PagedResponse<CostCenter>>(
      `/master/cost-centers?${params}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<CostCenter> => {
    const response = await apiClient.get(`/master/cost-centers/${id}`);
    return response.data;
  },

  getByDepartment: async (departmentId: number): Promise<CostCenter[]> => {
    const response = await apiClient.get(
      `/master/cost-centers/by-department/${departmentId}`
    );
    return response.data;
  },

  create: async (costCenter: Omit<CostCenter, 'id'>): Promise<CostCenter> => {
    const response = await apiClient.post('/master/cost-centers', costCenter);
    return response.data;
  },

  update: async (
    id: number,
    costCenter: Omit<CostCenter, 'id'>
  ): Promise<CostCenter> => {
    const response = await apiClient.put(
      `/master/cost-centers/${id}`,
      costCenter
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/cost-centers/${id}`);
  },

  exportToExcel: async (filters: CostCenterFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.departmentName)
      params.append('departmentName', filters.departmentName);

    const response = await apiClient.get(
      `/master/cost-centers/export?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

// React Query hooks
export const useCostCenters = () => {
  return useQuery({
    queryKey: COST_CENTER_QUERY_KEY,
    queryFn: costCenterAPI.getAll,
  });
};

export const useCostCentersPaged = (
  page = 0,
  size = 15,
  filters: CostCenterFilters = {}
) => {
  return useQuery({
    queryKey: [...COST_CENTER_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => costCenterAPI.getPaged(page, size, filters),
  });
};

export const useCostCenter = (id: number) => {
  return useQuery({
    queryKey: [...COST_CENTER_QUERY_KEY, id],
    queryFn: () => costCenterAPI.getById(id),
    enabled: !!id,
  });
};

export const useCostCentersByDepartment = (departmentId: number) => {
  return useQuery({
    queryKey: [...COST_CENTER_QUERY_KEY, 'department', departmentId],
    queryFn: () => costCenterAPI.getByDepartment(departmentId),
    enabled: !!departmentId,
  });
};

export const useCreateCostCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: costCenterAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_CENTER_QUERY_KEY });
    },
  });
};

export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CostCenter, 'id'> }) =>
      costCenterAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_CENTER_QUERY_KEY });
    },
  });
};

export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: costCenterAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COST_CENTER_QUERY_KEY });
    },
  });
};

export default costCenterAPI;
