import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface City {
  id?: number;
  stateId: number;
  stateName?: string;
  countryId?: number;
  countryName?: string;
  name: string;
  code: string;
}

export interface CityFilters {
  name?: string;
  code?: string;
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

const CITY_QUERY_KEY = ['cities'];

// API service functions
const cityAPI = {
  getAll: async (): Promise<City[]> => {
    const response = await apiClient.get('/master/cities/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: CityFilters = {}
  ): Promise<PagedResponse<City>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.stateName) params.append('stateName', filters.stateName);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/cities?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<City> => {
    const response = await apiClient.get(`/master/cities/${id}`);
    return response.data;
  },

  getByStateId: async (stateId: number): Promise<City[]> => {
    const response = await apiClient.get(`/master/cities/state/${stateId}`);
    return response.data;
  },

  create: async (city: Omit<City, 'id'>): Promise<City> => {
    const response = await apiClient.post('/master/cities', city);
    return response.data;
  },

  update: async (id: number, city: Omit<City, 'id'>): Promise<City> => {
    const response = await apiClient.put(`/master/cities/${id}`, city);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/cities/${id}`);
  },

  exportToExcel: async (filters: CityFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.stateName) params.append('stateName', filters.stateName);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/cities/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// React Query hooks
export const useCities = () => {
  return useQuery({
    queryKey: CITY_QUERY_KEY,
    queryFn: cityAPI.getAll,
  });
};

export const useCitiesPaged = (
  page = 0,
  size = 15,
  filters: CityFilters = {}
) => {
  return useQuery({
    queryKey: [...CITY_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => cityAPI.getPaged(page, size, filters),
  });
};

export const useCity = (id: number) => {
  return useQuery({
    queryKey: [...CITY_QUERY_KEY, id],
    queryFn: () => cityAPI.getById(id),
    enabled: !!id,
  });
};

export const useCitiesByState = (stateId: number) => {
  return useQuery({
    queryKey: [...CITY_QUERY_KEY, 'state', stateId],
    queryFn: () => cityAPI.getByStateId(stateId),
    enabled: !!stateId,
  });
};

export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cityAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEY });
    },
  });
};

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<City, 'id'> }) =>
      cityAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEY });
    },
  });
};

export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cityAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITY_QUERY_KEY });
    },
  });
};

export { cityAPI };
