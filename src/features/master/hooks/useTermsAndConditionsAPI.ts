import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { TermsAndConditions, PagedResponse } from '../types';

// API Service functions
const termsAndConditionsAPI = {
  getAll: async (page = 0, size = 20, content?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (content) params.append('content', content);

    const response = await apiClient.get<PagedResponse<TermsAndConditions>>(
      `/master/terms-and-conditions?${params}`
    );
    return response.data;
  },

  getAllList: async () => {
    const response = await apiClient.get<TermsAndConditions[]>(
      `/master/terms-and-conditions/all`
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<TermsAndConditions>(
      `/master/terms-and-conditions/${id}`
    );
    return response.data;
  },

  create: async (termsAndConditions: Omit<TermsAndConditions, 'id'>) => {
    const response = await apiClient.post<TermsAndConditions>(
      `/master/terms-and-conditions`,
      termsAndConditions
    );
    return response.data;
  },

  update: async (
    id: number,
    termsAndConditions: Partial<TermsAndConditions>
  ) => {
    const response = await apiClient.put<TermsAndConditions>(
      `/master/terms-and-conditions/${id}`,
      termsAndConditions
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/terms-and-conditions/${id}`);
  },
};

// React Query hooks
export const useTermsAndConditions = (
  page = 0,
  size = 20,
  content?: string
) => {
  return useQuery({
    queryKey: ['terms-and-conditions', page, size, content],
    queryFn: () => termsAndConditionsAPI.getAll(page, size, content),
    placeholderData: previousData => previousData,
  });
};

export const useTermsAndConditionsList = () => {
  return useQuery({
    queryKey: ['terms-and-conditions', 'list'],
    queryFn: termsAndConditionsAPI.getAllList,
  });
};

export const useTermsAndConditionsItem = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['terms-and-conditions', id],
    queryFn: () => termsAndConditionsAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateTermsAndConditions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: termsAndConditionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-and-conditions'] });
      toast.success('Terms and conditions created successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Failed to create terms and conditions';
      toast.error(message);
    },
  });
};

export const useUpdateTermsAndConditions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      termsAndConditions,
    }: {
      id: number;
      termsAndConditions: Partial<TermsAndConditions>;
    }) => termsAndConditionsAPI.update(id, termsAndConditions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-and-conditions'] });
      toast.success('Terms and conditions updated successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Failed to update terms and conditions';
      toast.error(message);
    },
  });
};

export const useDeleteTermsAndConditions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: termsAndConditionsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-and-conditions'] });
      toast.success('Terms and conditions deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Failed to delete terms and conditions';
      toast.error(message);
    },
  });
};

export default termsAndConditionsAPI;
