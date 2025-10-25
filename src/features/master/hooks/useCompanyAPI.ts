import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import type { Company, PagedResponse, MasterEntityFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API Service functions
const companyAPI = {
  getAll: async (page = 0, size = 20, filters: MasterEntityFilters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);
    if (filters.active !== undefined) params.append('active', filters.active.toString());

    const response = await apiClient.get<PagedResponse<Company>>(`/master/companies?${params}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Company>(`/master/companies/${id}`);
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get<Company[]>(`/master/companies/active`);
    return response.data;
  },

  create: async (company: Omit<Company, 'id'>) => {
    const response = await apiClient.post<Company>(`/master/companies`, company);
    return response.data;
  },

  update: async (id: number, company: Partial<Company>) => {
    const response = await apiClient.put<Company>(`/master/companies/${id}`, company);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/companies/${id}`);
  },

  toggleStatus: async (id: number) => {
    await apiClient.patch(`/master/companies/${id}/toggle-status`);
  },
};

// React Query hooks
export const useCompanies = (page = 0, size = 20, filters: MasterEntityFilters = {}) => {
  return useQuery({
    queryKey: ['companies', page, size, filters],
    queryFn: () => companyAPI.getAll(page, size, filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useCompany = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useActiveCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'active'],
    queryFn: companyAPI.getActive,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create company';
      toast.error(message);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, company }: { id: number; company: Partial<Company> }) =>
      companyAPI.update(id, company),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
      toast.success('Company updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update company';
      toast.error(message);
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete company';
      toast.error(message);
    },
  });
};

export const useToggleCompanyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyAPI.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company status updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update company status';
      toast.error(message);
    },
  });
};