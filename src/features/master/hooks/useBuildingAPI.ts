import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Building {
  id?: number;
  name: string;
  code: string;
  cityId?: number;
  cityName?: string;
}

const BUILDING_QUERY_KEY = ['buildings'];

// API service functions
const buildingAPI = {
  getAll: async (): Promise<Building[]> => {
    const response = await apiClient.get('/master/buildings/all');
    return response.data;
  },

  getById: async (id: number): Promise<Building> => {
    const response = await apiClient.get(`/master/buildings/${id}`);
    return response.data;
  },

  create: async (building: Omit<Building, 'id'>): Promise<Building> => {
    const response = await apiClient.post('/master/buildings', building);
    return response.data;
  },

  update: async (
    id: number,
    building: Omit<Building, 'id'>
  ): Promise<Building> => {
    const response = await apiClient.put(`/master/buildings/${id}`, building);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/buildings/${id}`);
  },
};

// React Query hooks
export const useBuildings = () => {
  return useQuery({
    queryKey: BUILDING_QUERY_KEY,
    queryFn: buildingAPI.getAll,
  });
};

export const useBuilding = (id: number) => {
  return useQuery({
    queryKey: [...BUILDING_QUERY_KEY, id],
    queryFn: () => buildingAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildingAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDING_QUERY_KEY });
    },
  });
};

export const useUpdateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Building, 'id'> }) =>
      buildingAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDING_QUERY_KEY });
    },
  });
};

export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildingAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUILDING_QUERY_KEY });
    },
  });
};
