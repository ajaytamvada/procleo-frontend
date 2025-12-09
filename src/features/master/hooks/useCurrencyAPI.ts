import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Currency, PagedResponse, MasterEntityFilters } from '../types';

const currencyAPI = {
  getAll: async (page = 0, size = 20, filters: MasterEntityFilters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get<PagedResponse<Currency>>(
      `/master/currencies?${params}`
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Currency>(`/master/currencies/${id}`);
    return response.data;
  },

  create: async (currency: Omit<Currency, 'id'>) => {
    const response = await apiClient.post<Currency>(
      '/master/currencies',
      currency
    );
    return response.data;
  },

  update: async (id: number, currency: Partial<Currency>) => {
    const response = await apiClient.put<Currency>(
      `/master/currencies/${id}`,
      currency
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/currencies/${id}`);
  },

  getAllList: async () => {
    const response = await apiClient.get<Currency[]>('/master/currencies/all');
    return response.data;
  },

  exportToExcel: async (filters: MasterEntityFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(
      `/master/currencies/export?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export const useCurrencies = (
  page = 0,
  size = 15,
  filters: MasterEntityFilters = {}
) => {
  return useQuery({
    queryKey: ['currencies', page, size, filters],
    queryFn: () => currencyAPI.getAll(page, size, filters),
  });
};

export const useCurrency = (id: number) => {
  return useQuery({
    queryKey: ['currency', id],
    queryFn: () => currencyAPI.getById(id),
    enabled: !!id,
  });
};

export const useCurrenciesList = () => {
  return useQuery({
    queryKey: ['currencies', 'list'],
    queryFn: () => currencyAPI.getAllList(),
  });
};

export default currencyAPI;
