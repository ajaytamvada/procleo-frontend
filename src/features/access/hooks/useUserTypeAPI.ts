import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE_URL = '/master/user-types';

export interface UserType {
  id?: number;
  name: string;
  code?: string;
  status: string;
  permissionClass?: string;
}

export interface UserTypeFilters {
  name?: string;
  status?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Fetch all user types
export const useUserTypes = () => {
  return useQuery({
    queryKey: ['userTypes'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserType[]>(API_BASE_URL);
      return data;
    },
  });
};

// Fetch active user types
export const useActiveUserTypes = () => {
  return useQuery({
    queryKey: ['userTypes', 'active'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserType[]>(`${API_BASE_URL}/active`);
      return data;
    },
  });
};

// Fetch paginated user types with filters
export const usePagedUserTypes = (page: number, size: number, filters: UserTypeFilters) => {
  return useQuery({
    queryKey: ['userTypes', 'paged', page, size, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(filters.name && { name: filters.name }),
        ...(filters.status && { status: filters.status }),
      });
      const { data} = await apiClient.get<PagedResponse<UserType>>(
        `${API_BASE_URL}/paged?${params.toString()}`
      );
      return data;
    },
  });
};

// Fetch single user type
export const useUserType = (id: number | undefined) => {
  return useQuery({
    queryKey: ['userTypes', id],
    queryFn: async () => {
      if (!id) throw new Error('User type ID is required');
      const { data } = await apiClient.get<UserType>(`${API_BASE_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create user type
export const useCreateUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userType: UserType) => {
      const { data } = await apiClient.post<UserType>(API_BASE_URL, userType);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTypes'] });
    },
  });
};

// Update user type
export const useUpdateUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userType }: { id: number; userType: UserType }) => {
      const { data } = await apiClient.put<UserType>(`${API_BASE_URL}/${id}`, userType);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTypes'] });
    },
  });
};

// Delete user type
export const useDeleteUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${API_BASE_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTypes'] });
    },
  });
};
