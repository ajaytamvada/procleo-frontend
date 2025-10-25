import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface State {
  id?: number;
  countryId: number;
  countryName?: string;
  name: string;
  code: string;
}

export interface StateFilters {
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

const STATE_QUERY_KEY = ['states'];

// API service functions
const stateAPI = {
  getAll: async (): Promise<State[]> => {
    const response = await apiClient.get('/master/states/all');
    return response.data;
  },

  getPaged: async (page = 0, size = 15, filters: StateFilters = {}): Promise<PagedResponse<State>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/states?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<State> => {
    const response = await apiClient.get(`/master/states/${id}`);
    return response.data;
  },

  getByCountryId: async (countryId: number): Promise<State[]> => {
    const response = await apiClient.get(`/master/states/country/${countryId}`);
    return response.data;
  },

  create: async (state: Omit<State, 'id'>): Promise<State> => {
    const response = await apiClient.post('/master/states', state);
    return response.data;
  },

  update: async (id: number, state: Omit<State, 'id'>): Promise<State> => {
    const response = await apiClient.put(`/master/states/${id}`, state);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/states/${id}`);
  },

  exportToExcel: async (filters: StateFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.countryName) params.append('countryName', filters.countryName);

    const response = await apiClient.get(`/master/states/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// React Query hooks
export const useStates = () => {
  return useQuery({
    queryKey: STATE_QUERY_KEY,
    queryFn: stateAPI.getAll,
  });
};

export const useStatesPaged = (page = 0, size = 15, filters: StateFilters = {}) => {
  return useQuery({
    queryKey: [...STATE_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => stateAPI.getPaged(page, size, filters),
  });
};

export const useState = (id: number) => {
  return useQuery({
    queryKey: [...STATE_QUERY_KEY, id],
    queryFn: () => stateAPI.getById(id),
    enabled: !!id,
  });
};

export const useStatesByCountry = (countryId: number) => {
  return useQuery({
    queryKey: [...STATE_QUERY_KEY, 'country', countryId],
    queryFn: () => stateAPI.getByCountryId(countryId),
    enabled: !!countryId,
  });
};

export const useCreateState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stateAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATE_QUERY_KEY });
    },
  });
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<State, 'id'> }) =>
      stateAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATE_QUERY_KEY });
    },
  });
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stateAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STATE_QUERY_KEY });
    },
  });
};

export { stateAPI };
