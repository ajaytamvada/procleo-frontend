import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const API_BASE_URL = '/master/assignment-groups';

export interface AssignmentGroupMember {
  id?: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  employeeEmail: string;
  contactNumber?: string;
}

export interface AssignmentGroup {
  id?: number;
  name: string;
  email?: string;
  fromValue?: number;
  toValue?: number;
  memberIds?: number[];
  members?: AssignmentGroupMember[];
}

export interface AssignmentGroupFilters {
  name?: string;
}

export interface PagedResponse {
  content: AssignmentGroup[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const ASSIGNMENT_GROUP_QUERY_KEY = ['assignment-groups'];

// API Functions
const assignmentGroupAPI = {
  getAll: async (): Promise<AssignmentGroup[]> => {
    const { data } = await apiClient.get(API_BASE_URL);
    return data;
  },

  getPaged: async (page: number, size: number, filters: AssignmentGroupFilters): Promise<PagedResponse> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/paged`, {
      params: { page, size, ...filters },
    });
    return data;
  },

  getById: async (id: number): Promise<AssignmentGroup> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/${id}`);
    return data;
  },

  create: async (group: AssignmentGroup): Promise<AssignmentGroup> => {
    const { data } = await apiClient.post(API_BASE_URL, group);
    return data;
  },

  update: async (id: number, group: AssignmentGroup): Promise<AssignmentGroup> => {
    const { data } = await apiClient.put(`${API_BASE_URL}/${id}`, group);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/${id}`);
  },

  getMembers: async (groupId: number): Promise<AssignmentGroupMember[]> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/${groupId}/members`);
    return data;
  },

  addMember: async (groupId: number, employeeId: number): Promise<void> => {
    await apiClient.post(`${API_BASE_URL}/${groupId}/members/${employeeId}`);
  },

  removeMember: async (groupId: number, employeeId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE_URL}/${groupId}/members/${employeeId}`);
  },

  exportToExcel: async (filters: AssignmentGroupFilters): Promise<Blob> => {
    const { data } = await apiClient.get(`${API_BASE_URL}/export`, {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};

// Query Hooks
export const useAssignmentGroupsList = () => {
  return useQuery({
    queryKey: ASSIGNMENT_GROUP_QUERY_KEY,
    queryFn: assignmentGroupAPI.getAll,
  });
};

export const useAssignmentGroupsPaged = (page = 0, size = 15, filters: AssignmentGroupFilters = {}) => {
  return useQuery({
    queryKey: [...ASSIGNMENT_GROUP_QUERY_KEY, 'paged', page, size, filters],
    queryFn: () => assignmentGroupAPI.getPaged(page, size, filters),
  });
};

export const useAssignmentGroup = (id: number) => {
  return useQuery({
    queryKey: [...ASSIGNMENT_GROUP_QUERY_KEY, id],
    queryFn: () => assignmentGroupAPI.getById(id),
    enabled: !!id,
  });
};

export const useGroupMembers = (groupId: number) => {
  return useQuery({
    queryKey: [...ASSIGNMENT_GROUP_QUERY_KEY, groupId, 'members'],
    queryFn: () => assignmentGroupAPI.getMembers(groupId),
    enabled: !!groupId,
  });
};

// Mutation Hooks
export const useCreateAssignmentGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignmentGroupAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_GROUP_QUERY_KEY });
    },
  });
};

export const useUpdateAssignmentGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, group }: { id: number; group: AssignmentGroup }) =>
      assignmentGroupAPI.update(id, group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_GROUP_QUERY_KEY });
    },
  });
};

export const useDeleteAssignmentGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignmentGroupAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_GROUP_QUERY_KEY });
    },
  });
};

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, employeeId }: { groupId: number; employeeId: number }) =>
      assignmentGroupAPI.addMember(groupId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_GROUP_QUERY_KEY });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, employeeId }: { groupId: number; employeeId: number }) =>
      assignmentGroupAPI.removeMember(groupId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_GROUP_QUERY_KEY });
    },
  });
};

// Export the API object for direct use
export { assignmentGroupAPI };
