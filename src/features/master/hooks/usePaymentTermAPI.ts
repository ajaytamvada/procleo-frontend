import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { PaymentTerm, PagedResponse } from '../types';

// API Service functions
const paymentTermAPI = {
  getAll: async (page = 0, size = 20, name?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (name) params.append('name', name);

    const response = await apiClient.get<PagedResponse<PaymentTerm>>(`/master/payment-terms?${params}`);
    return response.data;
  },

  getAllList: async () => {
    const response = await apiClient.get<PaymentTerm[]>(`/master/payment-terms/all`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<PaymentTerm>(`/master/payment-terms/${id}`);
    return response.data;
  },

  create: async (paymentTerm: Omit<PaymentTerm, 'id'>) => {
    const response = await apiClient.post<PaymentTerm>(`/master/payment-terms`, paymentTerm);
    return response.data;
  },

  update: async (id: number, paymentTerm: Partial<PaymentTerm>) => {
    const response = await apiClient.put<PaymentTerm>(`/master/payment-terms/${id}`, paymentTerm);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/payment-terms/${id}`);
  },
};

// React Query hooks
export const usePaymentTerms = (page = 0, size = 20, name?: string) => {
  return useQuery({
    queryKey: ['payment-terms', page, size, name],
    queryFn: () => paymentTermAPI.getAll(page, size, name),
    placeholderData: (previousData) => previousData,
  });
};

export const usePaymentTermsList = () => {
  return useQuery({
    queryKey: ['payment-terms', 'list'],
    queryFn: paymentTermAPI.getAllList,
  });
};

export const usePaymentTerm = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['payment-term', id],
    queryFn: () => paymentTermAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useCreatePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentTermAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
      toast.success('Payment term created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create payment term';
      toast.error(message);
    },
  });
};

export const useUpdatePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentTerm }: { id: number; paymentTerm: Partial<PaymentTerm> }) =>
      paymentTermAPI.update(id, paymentTerm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
      toast.success('Payment term updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update payment term';
      toast.error(message);
    },
  });
};

export const useDeletePaymentTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentTermAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-terms'] });
      toast.success('Payment term deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete payment term';
      toast.error(message);
    },
  });
};

export default paymentTermAPI;
