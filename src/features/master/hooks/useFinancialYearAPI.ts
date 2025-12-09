import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { FinancialYear, PagedResponse } from '../types';

// API Service functions
const financialYearAPI = {
  getAll: async (page = 0, size = 20, activeYear?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (activeYear !== undefined)
      params.append('activeYear', activeYear.toString());

    const response = await apiClient.get<PagedResponse<FinancialYear>>(
      `/master/financial-year?${params}`
    );
    return response.data;
  },

  getAllYears: async () => {
    const response = await apiClient.get<FinancialYear[]>(
      `/master/financial-year/all`
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<FinancialYear>(
      `/master/financial-year/${id}`
    );
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get<FinancialYear>(
      `/master/financial-year/active`
    );
    return response.data;
  },

  create: async (financialYear: Omit<FinancialYear, 'id'>) => {
    const response = await apiClient.post<FinancialYear>(
      `/master/financial-year`,
      financialYear
    );
    return response.data;
  },

  update: async (id: number, financialYear: Partial<FinancialYear>) => {
    const response = await apiClient.put<FinancialYear>(
      `/master/financial-year/${id}`,
      financialYear
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/financial-year/${id}`);
  },

  makeCurrent: async (id: number) => {
    await apiClient.patch(`/master/financial-year/${id}/make-current`);
  },
};

// React Query hooks
export const useFinancialYears = (page = 0, size = 20, activeYear?: number) => {
  return useQuery({
    queryKey: ['financial-years', page, size, activeYear],
    queryFn: () => financialYearAPI.getAll(page, size, activeYear),
    placeholderData: previousData => previousData,
  });
};

export const useAllFinancialYears = () => {
  return useQuery({
    queryKey: ['financial-years', 'all'],
    queryFn: financialYearAPI.getAllYears,
  });
};

export const useFinancialYear = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['financial-year', id],
    queryFn: () => financialYearAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useActiveFinancialYear = () => {
  return useQuery({
    queryKey: ['financial-year', 'active'],
    queryFn: financialYearAPI.getActive,
  });
};

export const useCreateFinancialYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialYearAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-years'] });
      toast.success('Financial year created successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create financial year';
      toast.error(message);
    },
  });
};

export const useUpdateFinancialYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      financialYear,
    }: {
      id: number;
      financialYear: Partial<FinancialYear>;
    }) => financialYearAPI.update(id, financialYear),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-years'] });
      queryClient.invalidateQueries({
        queryKey: ['financial-year', variables.id],
      });
      toast.success('Financial year updated successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to update financial year';
      toast.error(message);
    },
  });
};

export const useDeleteFinancialYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialYearAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-years'] });
      toast.success('Financial year deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to delete financial year';
      toast.error(message);
    },
  });
};

export const useMakeCurrentYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialYearAPI.makeCurrent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-years'] });
      queryClient.invalidateQueries({ queryKey: ['financial-year', 'active'] });
      toast.success('Financial year set as current successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to set current financial year';
      toast.error(message);
    },
  });
};
