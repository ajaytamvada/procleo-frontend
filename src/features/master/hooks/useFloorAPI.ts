import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Floor {
  id?: number;
  buildingId: number;
  buildingName?: string;
  name: string;
  code?: string;
  zipCode?: number;
}

export interface FloorFilters {
  name?: string;
  code?: string;
  buildingName?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const FLOOR_QUERY_KEY = ['floors'];

// API service functions
const floorAPI = {
  getAll: async (): Promise<Floor[]> => {
    const response = await apiClient.get('/master/floors/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: FloorFilters = {}
  ): Promise<PagedResponse<Floor>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.buildingName)
      params.append('buildingName', filters.buildingName);

    const response = await apiClient.get(`/master/floors?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Floor> => {
    const response = await apiClient.get(`/master/floors/${id}`);
    return response.data;
  },

  getByBuildingId: async (buildingId: number): Promise<Floor[]> => {
    const response = await apiClient.get(
      `/master/floors/building/${buildingId}`
    );
    return response.data;
  },

  create: async (floor: Omit<Floor, 'id'>): Promise<Floor> => {
    const response = await apiClient.post('/master/floors', floor);
    return response.data;
  },

  update: async (id: number, floor: Omit<Floor, 'id'>): Promise<Floor> => {
    const response = await apiClient.put(`/master/floors/${id}`, floor);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/floors/${id}`);
  },

  exportToExcel: async (filters: FloorFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.buildingName)
      params.append('buildingName', filters.buildingName);

    const response = await apiClient.get(`/master/floors/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// React Query hooks
export const useFloors = () => {
  return useQuery({
    queryKey: FLOOR_QUERY_KEY,
    queryFn: floorAPI.getAll,
  });
};

export const useFloorsPaged = (
  page = 0,
  size = 15,
  filters: FloorFilters = {}
) => {
  return useQuery({
    queryKey: [...FLOOR_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => floorAPI.getPaged(page, size, filters),
  });
};

export const useFloor = (id: number) => {
  return useQuery({
    queryKey: [...FLOOR_QUERY_KEY, id],
    queryFn: () => floorAPI.getById(id),
    enabled: !!id,
  });
};

export const useFloorsByBuilding = (buildingId: number) => {
  return useQuery({
    queryKey: [...FLOOR_QUERY_KEY, 'building', buildingId],
    queryFn: () => floorAPI.getByBuildingId(buildingId),
    enabled: !!buildingId,
  });
};

export const useCreateFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: floorAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOOR_QUERY_KEY });
    },
  });
};

export const useUpdateFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Floor, 'id'> }) =>
      floorAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOOR_QUERY_KEY });
    },
  });
};

export const useDeleteFloor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: floorAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOOR_QUERY_KEY });
    },
  });
};

export { floorAPI };
