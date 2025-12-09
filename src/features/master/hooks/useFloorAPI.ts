import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Floor {
  id?: number;
  countryId: number;
  countryName?: string;
  stateId: number;
  stateName?: string;
  cityId: number;
  cityName?: string;
  name: string;
  code?: string;
  zipCode?: number;
}

export interface FloorFilters {
  name?: string;
  code?: string;
  cityName?: string;
  stateName?: string;
  countryName?: string;
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
    if (filters.cityName) params.append('cityName', filters.cityName);
    if (filters.stateName) params.append('stateName', filters.stateName);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/floors?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Floor> => {
    const response = await apiClient.get(`/master/floors/${id}`);
    return response.data;
  },

  getByCityId: async (cityId: number): Promise<Floor[]> => {
    const response = await apiClient.get(`/master/floors/city/${cityId}`);
    return response.data;
  },

  getByStateId: async (stateId: number): Promise<Floor[]> => {
    const response = await apiClient.get(`/master/floors/state/${stateId}`);
    return response.data;
  },

  getByCountryId: async (countryId: number): Promise<Floor[]> => {
    const response = await apiClient.get(`/master/floors/country/${countryId}`);
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
    if (filters.cityName) params.append('cityName', filters.cityName);
    if (filters.stateName) params.append('stateName', filters.stateName);
    if (filters.countryName) params.append('countryName', filters.countryName);

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

export const useFloorsByCity = (cityId: number) => {
  return useQuery({
    queryKey: [...FLOOR_QUERY_KEY, 'city', cityId],
    queryFn: () => floorAPI.getByCityId(cityId),
    enabled: !!cityId,
  });
};

export const useFloorsByState = (stateId: number) => {
  return useQuery({
    queryKey: [...FLOOR_QUERY_KEY, 'state', stateId],
    queryFn: () => floorAPI.getByStateId(stateId),
    enabled: !!stateId,
  });
};

export const useFloorsByCountry = (countryId: number) => {
  return useQuery({
    queryKey: [...FLOOR_QUERY_KEY, 'country', countryId],
    queryFn: () => floorAPI.getByCountryId(countryId),
    enabled: !!countryId,
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
