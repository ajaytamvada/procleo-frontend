import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Designation {
  id?: number;
  name: string;
  code: string;
}

export interface DesignationFilters {
  name?: string;
  code?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
}

const DESIGNATION_QUERY_KEY = ['designations'];

// API service functions
const designationAPI = {
  getAll: async (): Promise<Designation[]> => {
    const response = await apiClient.get('/master/designations/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: DesignationFilters = {}
  ): Promise<PagedResponse<Designation>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get<PagedResponse<Designation>>(
      `/master/designations?${params}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<Designation> => {
    const response = await apiClient.get(`/master/designations/${id}`);
    return response.data;
  },

  create: async (
    designation: Omit<Designation, 'id'>
  ): Promise<Designation> => {
    const response = await apiClient.post('/master/designations', designation);
    return response.data;
  },

  update: async (
    id: number,
    designation: Omit<Designation, 'id'>
  ): Promise<Designation> => {
    const response = await apiClient.put(
      `/master/designations/${id}`,
      designation
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/designations/${id}`);
  },

  exportToExcel: async (filters: DesignationFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(
      `/master/designations/export?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

// React Query hooks
export const useDesignations = () => {
  return useQuery({
    queryKey: DESIGNATION_QUERY_KEY,
    queryFn: designationAPI.getAll,
  });
};

export const useDesignationsPaged = (
  page = 0,
  size = 15,
  filters: DesignationFilters = {}
) => {
  return useQuery({
    queryKey: [...DESIGNATION_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => designationAPI.getPaged(page, size, filters),
  });
};

export const useDesignation = (id: number) => {
  return useQuery({
    queryKey: [...DESIGNATION_QUERY_KEY, id],
    queryFn: () => designationAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: designationAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESIGNATION_QUERY_KEY });
    },
  });
};

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Designation, 'id'> }) =>
      designationAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESIGNATION_QUERY_KEY });
    },
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: designationAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESIGNATION_QUERY_KEY });
    },
  });
};

export default designationAPI;
