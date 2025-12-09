import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface Tax {
  id?: number;
  primaryTaxName: string;
  secondaryTaxName?: string;
  primaryTaxPercentage?: number;
  secondaryTaxPercentage?: number;
  taxCode?: string;
  purchaseOrderType?: string;
  active?: boolean;
  remarks?: string;
}

const TAX_QUERY_KEY = ['taxes'];

// API service functions
const taxAPI = {
  getAll: async (): Promise<Tax[]> => {
    const response = await apiClient.get('/master/taxes/all');
    return response.data;
  },

  getById: async (id: number): Promise<Tax> => {
    const response = await apiClient.get(`/master/taxes/${id}`);
    return response.data;
  },

  create: async (tax: Omit<Tax, 'id'>): Promise<Tax> => {
    const response = await apiClient.post('/master/taxes', tax);
    return response.data;
  },

  update: async (id: number, tax: Omit<Tax, 'id'>): Promise<Tax> => {
    const response = await apiClient.put(`/master/taxes/${id}`, tax);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/taxes/${id}`);
  },
};

// React Query hooks
export const useTaxes = () => {
  return useQuery({
    queryKey: TAX_QUERY_KEY,
    queryFn: taxAPI.getAll,
  });
};

export const useTax = (id: number) => {
  return useQuery({
    queryKey: [...TAX_QUERY_KEY, id],
    queryFn: () => taxAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taxAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEY });
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Tax, 'id'> }) =>
      taxAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEY });
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taxAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEY });
    },
  });
};
