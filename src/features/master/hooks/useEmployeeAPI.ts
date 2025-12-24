import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE_URL = '/master/employees';

export interface Employee {
  id?: number;
  name: string;
  code: string;
  email: string;
  contactNumber?: string;
  designationId?: number;
  designationName?: string;
  departmentId?: number;
  departmentName?: string;
  stateId?: number;
  stateName?: string;
  reportingManagerId?: number;
  reportingManagerName?: string;
  employeeType: string; // "Employee" or "Contract"
  status: string; // "Working" or "Non Working"
  imagePath?: string;
}

export interface EmployeeFilters {
  name?: string;
  code?: string;
  email?: string;
  designationName?: string;
  departmentName?: string;
  status?: string;
}

export interface PagedResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const EMPLOYEE_QUERY_KEY = ['employees'];

// API Functions
const employeeAPI = {
  getAll: async (): Promise<Employee[]> => {
    const { data } = await apiClient.get(API_BASE_URL);
    return data;
  },

  getPaged: async (
    page: number,
    size: number,
    filters: EmployeeFilters
  ): Promise<PagedResponse> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/paged`, {
      params: { page, size, ...filters },
    });
    return data;
  },

  getById: async (id: number): Promise<Employee> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/${id}`);
    return data;
  },

  getWorking: async (): Promise<Employee[]> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/working`);
    return data;
  },

  getWorkingByDepartment: async (departmentId: number): Promise<Employee[]> => {
    const { data } = await apiClient.get(
      `${API_BASE_URL}/by-department/${departmentId}`
    );
    return data;
  },

  create: async (employee: Employee): Promise<Employee> => {
    const { data } = await apiClient.post(API_BASE_URL, employee);
    return data;
  },

  update: async (id: number, employee: Employee): Promise<Employee> => {
    const { data } = await apiClient.put(`${API_BASE_URL}/${id}`, employee);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/${id}`);
  },

  exportToExcel: async (filters: EmployeeFilters): Promise<Blob> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/export`, {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};

// Query Hooks
export const useEmployeesList = () => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEY,
    queryFn: employeeAPI.getAll,
  });
};

export const useEmployeesPaged = (
  page = 0,
  size = 15,
  filters: EmployeeFilters = {}
) => {
  return useQuery({
    queryKey: [...EMPLOYEE_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => employeeAPI.getPaged(page, size, filters),
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: [...EMPLOYEE_QUERY_KEY, id],
    queryFn: () => employeeAPI.getById(id),
    enabled: !!id,
  });
};

export const useWorkingEmployees = () => {
  return useQuery({
    queryKey: [...EMPLOYEE_QUERY_KEY, 'working'],
    queryFn: employeeAPI.getWorking,
  });
};

export const useWorkingEmployeesByDepartment = (departmentId: number) => {
  return useQuery({
    queryKey: [...EMPLOYEE_QUERY_KEY, 'working', 'department', departmentId],
    queryFn: () => employeeAPI.getWorkingByDepartment(departmentId),
    enabled: !!departmentId,
  });
};

// Mutation Hooks
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEY });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employee }: { id: number; employee: Employee }) =>
      employeeAPI.update(id, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEY });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEY });
    },
  });
};

// Export the API object for direct use
export { employeeAPI };
