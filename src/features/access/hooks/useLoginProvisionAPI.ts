import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE_URL = '/master/login-provision';

export interface LoginProvision {
  id?: number;
  employeeId: string | number;
  employeeName?: string;
  loginName: string;
  email?: string;
  password?: string;
  userTypeId?: number;
  userTypeName?: string;
  status: number;
  disableDate?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Fetch all users
export const useLoginProvisions = () => {
  return useQuery({
    queryKey: ['loginProvisions'],
    queryFn: async () => {
      const { data } = await apiClient.get<LoginProvision[]>(API_BASE_URL);
      return data;
    },
  });
};

// Search users with pagination
export const useSearchLoginProvisions = (
  searchWord: string,
  page: number,
  size: number
) => {
  return useQuery({
    queryKey: ['loginProvisions', 'search', searchWord, page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PagedResponse<LoginProvision>>(
        `${API_BASE_URL}/search`,
        {
          params: { searchWord, page, size },
        }
      );
      return data;
    },
  });
};

// Fetch single user
export const useLoginProvision = (id: number | undefined) => {
  return useQuery({
    queryKey: ['loginProvisions', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');
      const { data } = await apiClient.get<LoginProvision>(
        `${API_BASE_URL}/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
};

// Create user
export const useCreateLoginProvision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: LoginProvision) => {
      const { data } = await apiClient.post<LoginProvision>(API_BASE_URL, user);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginProvisions'] });
    },
  });
};

// Update user
export const useUpdateLoginProvision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, user }: { id: number; user: LoginProvision }) => {
      const { data } = await apiClient.put<LoginProvision>(
        `${API_BASE_URL}/${id}`,
        user
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginProvisions'] });
    },
  });
};

// Delete user
export const useDeleteLoginProvision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${API_BASE_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loginProvisions'] });
    },
  });
};

// Check if login name exists
export const useCheckLoginName = (loginName: string, id?: number) => {
  return useQuery({
    queryKey: ['checkLoginName', loginName, id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ exists: boolean }>(
        `${API_BASE_URL}/check-login-name`,
        {
          params: { loginName, id },
        }
      );
      return data.exists;
    },
    enabled: !!loginName && loginName.length >= 3,
  });
};
