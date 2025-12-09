import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Location {
  id?: number;
  name: string;
  code: string;
}

const LOCATION_QUERY_KEY = ['locations'];

// API service functions
const locationAPI = {
  getAll: async (): Promise<Location[]> => {
    const response = await apiClient.get('/master/locations/all');
    return response.data;
  },

  getById: async (id: number): Promise<Location> => {
    const response = await apiClient.get(`/master/locations/${id}`);
    return response.data;
  },

  create: async (location: Omit<Location, 'id'>): Promise<Location> => {
    const response = await apiClient.post('/master/locations', location);
    return response.data;
  },

  update: async (
    id: number,
    location: Omit<Location, 'id'>
  ): Promise<Location> => {
    const response = await apiClient.put(`/master/locations/${id}`, location);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/locations/${id}`);
  },
};

// React Query hooks
export const useLocations = () => {
  return useQuery({
    queryKey: LOCATION_QUERY_KEY,
    queryFn: locationAPI.getAll,
  });
};

export const useLocation = (id: number) => {
  return useQuery({
    queryKey: [...LOCATION_QUERY_KEY, id],
    queryFn: () => locationAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEY });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Location, 'id'> }) =>
      locationAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEY });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATION_QUERY_KEY });
    },
  });
};
