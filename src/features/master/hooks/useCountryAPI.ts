import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Country {
  id?: number;
  name: string;
  code: string;
}

export interface CountryFilters {
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

const COUNTRY_QUERY_KEY = ['countries'];

// API service functions
const countryAPI = {
  getAll: async (): Promise<Country[]> => {
    const response = await apiClient.get('/master/countries/all');
    return response.data;
  },

  getPaged: async (page = 0, size = 15, filters: CountryFilters = {}): Promise<PagedResponse<Country>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(`/master/countries?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<Country> => {
    const response = await apiClient.get(`/master/countries/${id}`);
    return response.data;
  },

  create: async (country: Omit<Country, 'id'>): Promise<Country> => {
    const response = await apiClient.post('/master/countries', country);
    return response.data;
  },

  update: async (id: number, country: Omit<Country, 'id'>): Promise<Country> => {
    const response = await apiClient.put(`/master/countries/${id}`, country);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/countries/${id}`);
  },

  exportToExcel: async (filters: CountryFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(`/master/countries/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// React Query hooks
export const useCountries = () => {
  return useQuery({
    queryKey: COUNTRY_QUERY_KEY,
    queryFn: countryAPI.getAll,
  });
};

export const useCountriesPaged = (page = 0, size = 15, filters: CountryFilters = {}) => {
  return useQuery({
    queryKey: [...COUNTRY_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => countryAPI.getPaged(page, size, filters),
  });
};

export const useCountry = (id: number) => {
  return useQuery({
    queryKey: [...COUNTRY_QUERY_KEY, id],
    queryFn: () => countryAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countryAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUNTRY_QUERY_KEY });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Country, 'id'> }) =>
      countryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUNTRY_QUERY_KEY });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countryAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUNTRY_QUERY_KEY });
    },
  });
};

export { countryAPI };
