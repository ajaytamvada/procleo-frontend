import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { PurchaseRequest, PurchaseRequestFilters, PagedResponse, PRStatus } from '../types';

const purchaseRequestAPI = {
  getAll: async (): Promise<PurchaseRequest[]> => {
    const response = await apiClient.get('/purchase/requests/all');
    return response.data;
  },

  getPaged: async (
    page = 0,
    size = 15,
    filters: PurchaseRequestFilters = {}
  ): Promise<PagedResponse<PurchaseRequest>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters.requestNumber) params.append('requestNumber', filters.requestNumber);
    if (filters.requestedBy) params.append('requestedBy', filters.requestedBy);
    if (filters.departmentId) params.append('departmentId', filters.departmentId.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    const response = await apiClient.get(`/purchase/requests?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<PurchaseRequest> => {
    const response = await apiClient.get(`/purchase/requests/${id}`);
    return response.data;
  },

  getDrafts: async (): Promise<PurchaseRequest[]> => {
    const response = await apiClient.get('/purchase/requests/drafts');
    return response.data;
  },

  getSubmitted: async (): Promise<PurchaseRequest[]> => {
    const response = await apiClient.get('/purchase/requests/submitted');
    return response.data;
  },

  create: async (
    purchaseRequest: Omit<PurchaseRequest, 'id'>,
    sendForApproval: boolean = false
  ): Promise<PurchaseRequest> => {
    const response = await apiClient.post(
      `/purchase/requests?sendForApproval=${sendForApproval}`,
      purchaseRequest
    );
    return response.data;
  },

  update: async (
    id: number,
    purchaseRequest: Omit<PurchaseRequest, 'id'>,
    sendForApproval: boolean = false
  ): Promise<PurchaseRequest> => {
    const response = await apiClient.put(
      `/purchase/requests/${id}?sendForApproval=${sendForApproval}`,
      purchaseRequest
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase/requests/${id}`);
  },

  getPRStatus: async (search?: string): Promise<PRStatus[]> => {
    const params = search ? new URLSearchParams({ search }) : '';
    const response = await apiClient.get(`/purchase/requests/status${params ? `?${params}` : ''}`);
    return response.data;
  },

  exportToExcel: async (filters: PurchaseRequestFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.requestNumber) params.append('requestNumber', filters.requestNumber);
    if (filters.requestedBy) params.append('requestedBy', filters.requestedBy);
    if (filters.departmentId) params.append('departmentId', filters.departmentId.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    const response = await apiClient.get(`/purchase/requests/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const usePurchaseRequests = () => {
  return useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests'],
    queryFn: purchaseRequestAPI.getAll,
  });
};

export const usePurchaseRequestsPaged = (
  page: number,
  size: number,
  filters: PurchaseRequestFilters
) => {
  return useQuery<PagedResponse<PurchaseRequest>>({
    queryKey: ['purchaseRequests', 'paged', page, size, filters],
    queryFn: () => purchaseRequestAPI.getPaged(page, size, filters),
  });
};

export const usePurchaseRequest = (id: number) => {
  return useQuery<PurchaseRequest>({
    queryKey: ['purchaseRequest', id],
    queryFn: () => purchaseRequestAPI.getById(id),
    enabled: !!id,
  });
};

export const useDraftPurchaseRequests = () => {
  return useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests', 'drafts'],
    queryFn: purchaseRequestAPI.getDrafts,
  });
};

export const useSubmittedPurchaseRequests = () => {
  return useQuery<PurchaseRequest[]>({
    queryKey: ['purchaseRequests', 'submitted'],
    queryFn: purchaseRequestAPI.getSubmitted,
  });
};

export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, sendForApproval }: { data: Omit<PurchaseRequest, 'id'>; sendForApproval: boolean }) =>
      purchaseRequestAPI.create(data, sendForApproval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

export const useUpdatePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      sendForApproval,
    }: {
      id: number;
      data: Omit<PurchaseRequest, 'id'>;
      sendForApproval: boolean;
    }) => purchaseRequestAPI.update(id, data, sendForApproval),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

export const useDeletePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

export const usePRStatus = (search?: string) => {
  return useQuery<PRStatus[]>({
    queryKey: ['prStatus', search],
    queryFn: () => purchaseRequestAPI.getPRStatus(search),
  });
};

export default purchaseRequestAPI;
