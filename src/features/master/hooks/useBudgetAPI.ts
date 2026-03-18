import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Budget, BudgetTransaction, PagedResponse } from '../types';

// API Service functions
const budgetAPI = {
  getAll: async (page = 0, size = 20, financialYearId?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (financialYearId !== undefined)
      params.append('financialYearId', financialYearId.toString());

    const response = await apiClient.get<PagedResponse<Budget>>(
      `/master/budget?${params}`
    );
    return response.data;
  },

  getAllBudgets: async () => {
    const response = await apiClient.get<Budget[]>(`/master/budget/all`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Budget>(`/master/budget/${id}`);
    return response.data;
  },

  getByFinancialYear: async (financialYearId: number) => {
    const response = await apiClient.get<Budget[]>(
      `/master/budget/financial-year/${financialYearId}`
    );
    return response.data;
  },

  create: async (budget: Omit<Budget, 'id'>) => {
    const response = await apiClient.post<Budget>(`/master/budget`, budget);
    return response.data;
  },

  update: async (id: number, budget: Partial<Budget>) => {
    const response = await apiClient.put<Budget>(
      `/master/budget/${id}`,
      budget
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/budget/${id}`);
  },

  // ---- New Budget Enforcement APIs ----

  checkBudget: async (departmentId: number): Promise<Budget> => {
    const response = await apiClient.get<Budget>(
      `/master/budget/check?departmentId=${departmentId}`
    );
    return response.data;
  },

  getTransactions: async (budgetId: number): Promise<BudgetTransaction[]> => {
    const response = await apiClient.get<BudgetTransaction[]>(
      `/master/budget/${budgetId}/transactions`
    );
    return response.data;
  },

  reviseBudget: async (
    budgetId: number,
    newAmount: number,
    revisedBy?: number,
    remarks?: string
  ): Promise<Budget> => {
    const response = await apiClient.put<Budget>(
      `/master/budget/${budgetId}/revise`,
      { newAmount, revisedBy, remarks }
    );
    return response.data;
  },
};

// React Query hooks
export const useBudgets = (page = 0, size = 20, financialYearId?: number) => {
  return useQuery({
    queryKey: ['budgets', page, size, financialYearId],
    queryFn: () => budgetAPI.getAll(page, size, financialYearId),
    placeholderData: previousData => previousData,
  });
};

export const useAllBudgets = () => {
  return useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: budgetAPI.getAllBudgets,
  });
};

export const useBudget = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useBudgetsByFinancialYear = (
  financialYearId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ['budgets', 'financial-year', financialYearId],
    queryFn: () => budgetAPI.getByFinancialYear(financialYearId),
    enabled: enabled && !!financialYearId,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create budget';
      toast.error(message);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, budget }: { id: number; budget: Partial<Budget> }) =>
      budgetAPI.update(id, budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to update budget';
      toast.error(message);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to delete budget';
      toast.error(message);
    },
  });
};

// ---- New Budget Enforcement hooks ----

export const useBudgetCheck = (departmentId: number, enabled = true) => {
  return useQuery({
    queryKey: ['budget-check', departmentId],
    queryFn: () => budgetAPI.checkBudget(departmentId),
    enabled: enabled && !!departmentId,
  });
};

export const useBudgetTransactions = (budgetId: number, enabled = true) => {
  return useQuery({
    queryKey: ['budget-transactions', budgetId],
    queryFn: () => budgetAPI.getTransactions(budgetId),
    enabled: enabled && !!budgetId,
  });
};

export const useReviseBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      budgetId,
      newAmount,
      revisedBy,
      remarks,
    }: {
      budgetId: number;
      newAmount: number;
      revisedBy?: number;
      remarks?: string;
    }) => budgetAPI.reviseBudget(budgetId, newAmount, revisedBy, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget revised successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to revise budget';
      toast.error(message);
    },
  });
};
