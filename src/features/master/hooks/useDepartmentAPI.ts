import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Department, PagedResponse, MasterEntityFilters } from '../types';

const departmentAPI = {
  getAll: async (page = 0, size = 20, filters: MasterEntityFilters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get<PagedResponse<Department>>(
      `/master/departments?${params}`
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Department>(
      `/master/departments/${id}`
    );
    return response.data;
  },

  create: async (department: Omit<Department, 'id'>) => {
    const response = await apiClient.post<Department>(
      '/master/departments',
      department
    );
    return response.data;
  },

  update: async (id: number, department: Partial<Department>) => {
    const response = await apiClient.put<Department>(
      `/master/departments/${id}`,
      department
    );
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/master/departments/${id}`);
  },

  getAllList: async () => {
    const response = await apiClient.get<Department[]>(
      '/master/departments/all'
    );
    return response.data;
  },

  exportToExcel: async (filters: MasterEntityFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.code) params.append('code', filters.code);

    const response = await apiClient.get(
      `/master/departments/export?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export const useDepartments = (
  page = 0,
  size = 15,
  filters: MasterEntityFilters = {}
) => {
  return useQuery({
    queryKey: ['departments', page, size, filters],
    queryFn: () => departmentAPI.getAll(page, size, filters),
  });
};

export const useDepartment = (id: number) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentAPI.getById(id),
    enabled: !!id,
  });
};

export const useDepartmentsList = () => {
  return useQuery({
    queryKey: ['departments', 'list'],
    queryFn: () => departmentAPI.getAllList(),
  });
};

export default departmentAPI;
