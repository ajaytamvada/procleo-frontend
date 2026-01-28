import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Location {
  id?: number;
  countryId?: number;
  countryName?: string;
  country?: string; // To match form
  name: string;
  code?: string; // Optional in form
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  remarks?: string;
}

export interface LocationFilters {
  name?: string;
  code?: string;
  countryName?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const LOCATION_QUERY_KEY = ['locations'];

// API service functions
const locationAPI = {
  getAll: async (): Promise<Location[]> => {
    const response = await apiClient.get('/master/locations/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: LocationFilters = {}
  ): Promise<PagedResponse<Location>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/locations?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Location> => {
    const response = await apiClient.get(`/master/locations/${id}`);
    return response.data;
  },

  getByCountryId: async (countryId: number): Promise<Location[]> => {
    const response = await apiClient.get(
      `/master/locations/country/${countryId}`
    );
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

  exportToExcel: async (filters: LocationFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/locations/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// React Query hooks
export const useLocations = () => {
  return useQuery({
    queryKey: LOCATION_QUERY_KEY,
    queryFn: locationAPI.getAll,
  });
};

export const useLocationsPaged = (
  page = 0,
  size = 15,
  filters: LocationFilters = {}
) => {
  return useQuery({
    queryKey: [...LOCATION_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => locationAPI.getPaged(page, size, filters),
  });
};

export const useLocation = (id: number) => {
  return useQuery({
    queryKey: [...LOCATION_QUERY_KEY, id],
    queryFn: () => locationAPI.getById(id),
    enabled: !!id,
  });
};

export const useLocationsByCountry = (countryId: number) => {
  return useQuery({
    queryKey: [...LOCATION_QUERY_KEY, 'country', countryId],
    queryFn: () => locationAPI.getByCountryId(countryId),
    enabled: !!countryId,
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

export { locationAPI };
