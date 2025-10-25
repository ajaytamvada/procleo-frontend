import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { queryKeys, queryUtils } from '@/lib/query-client';
import { useAppActions } from '@/store/appStore';

// Types
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  success: boolean;
  message?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
  };
  requesterId: string;
  requester: {
    id: string;
    name: string;
    department: string;
  };
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled';
  totalAmount: number;
  currency: string;
  description?: string;
  items: PurchaseOrderItem[];
  attachments: string[];
  approvals: PurchaseOrderApproval[];
  createdAt: string;
  updatedAt: string;
  expectedDelivery?: string;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  specifications?: string;
}

export interface PurchaseOrderApproval {
  id: string;
  approverId: string;
  approver: {
    id: string;
    name: string;
    role: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp: string;
}

export interface CreatePurchaseOrderData {
  vendorId: string;
  description?: string;
  items: Omit<PurchaseOrderItem, 'id'>[];
  expectedDelivery?: string;
  attachments?: File[];
}

export interface UpdatePurchaseOrderData extends Partial<CreatePurchaseOrderData> {
  status?: PurchaseOrder['status'];
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrder['status'][];
  vendorId?: string;
  requesterId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Purchase Orders Service
class PurchaseOrderService {
  static async getAll(filters: PurchaseOrderFilters = {}): Promise<PaginatedResponse<PurchaseOrder>> {
    return api.getPaginated<PurchaseOrder>('/purchase-orders', filters);
  }

  static async getById(id: string): Promise<PurchaseOrder> {
    const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return response.data;
  }

  static async create(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>('/purchase-orders', data);
    return response.data;
  }

  static async update(id: string, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> {
    const response = await api.put<PurchaseOrder>(`/purchase-orders/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/purchase-orders/${id}`);
  }

  static async approve(id: string, comments?: string): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>(`/purchase-orders/${id}/approve`, { comments });
    return response.data;
  }

  static async reject(id: string, comments: string): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>(`/purchase-orders/${id}/reject`, { comments });
    return response.data;
  }

  static async cancel(id: string, reason: string): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`, { reason });
    return response.data;
  }

  static async duplicate(id: string): Promise<PurchaseOrder> {
    const response = await api.post<PurchaseOrder>(`/purchase-orders/${id}/duplicate`);
    return response.data;
  }

  static async exportToPdf(id: string): Promise<void> {
    await api.downloadFile(`/purchase-orders/${id}/export/pdf`, `PO-${id}.pdf`);
  }

  static async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    totalValue: number;
    averageValue: number;
  }> {
    const response = await api.get<{
      total: number;
      pending: number;
      approved: number;
      totalValue: number;
      averageValue: number;
    }>('/purchase-orders/statistics');
    return response.data;
  }
}

// Query hooks
export function usePurchaseOrders(filters: PurchaseOrderFilters = {}) {
  const { setLoading, setError } = useAppActions();

  return useQuery({
    queryKey: queryKeys.purchaseOrders.list(filters),
    queryFn: () => PurchaseOrderService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePurchaseOrder(id: string) {
  const { setError } = useAppActions();

  return useQuery({
    queryKey: queryKeys.purchaseOrders.detail(id),
    queryFn: () => PurchaseOrderService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePurchaseOrderStatistics() {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.statistics(),
    queryFn: PurchaseOrderService.getStatistics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutation hooks
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppActions();

  return useMutation({
    mutationFn: PurchaseOrderService.create,
    onMutate: async (newPO) => {
      // Optimistic update for list queries
      const listQueries = queryClient.getQueriesData({ 
        queryKey: queryKeys.purchaseOrders.lists() 
      });

      const optimisticPO: PurchaseOrder = {
        id: `temp-${Date.now()}`,
        poNumber: `PO-${Date.now()}`,
        ...newPO,
        requesterId: 'current',
        vendor: { id: newPO.vendorId, name: 'Loading...', email: '' },
        requester: { id: 'current', name: 'You', department: '' },
        status: 'draft',
        totalAmount: newPO.items.reduce((sum, item) => sum + item.totalPrice, 0),
        currency: 'USD',
        items: newPO.items.map((item, index) => ({ ...item, id: `temp-item-${index}` })),
        attachments: [],
        approvals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;

      // Update each list query optimistically
      listQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          const typedOldData = oldData as PaginatedResponse<PurchaseOrder>;
          queryClient.setQueryData(queryKey, {
            ...typedOldData,
            data: [optimisticPO, ...typedOldData.data],
            pagination: {
              ...typedOldData.pagination,
              total: typedOldData.pagination.total + 1,
            },
          });
        }
      });

      return { optimisticPO };
    },
    onSuccess: (data) => {
      // Invalidate and refetch purchase orders
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.statistics() });
      
      // Add success notification
      addNotification({
        type: 'success',
        title: 'Purchase Order Created',
        message: `PO ${data.poNumber} has been created successfully.`,
        read: false,
      });

      toast.success('Purchase order created successfully');
    },
    onError: (error: any, variables, context) => {
      // Remove optimistic update on error
      if (context?.optimisticPO) {
        const listQueries = queryClient.getQueriesData({ 
          queryKey: queryKeys.purchaseOrders.lists() 
        });

        listQueries.forEach(([queryKey, oldData]) => {
          if (oldData) {
            const typedOldData = oldData as PaginatedResponse<PurchaseOrder>;
            queryClient.setQueryData(queryKey, {
              ...typedOldData,
              data: typedOldData.data.filter((po: PurchaseOrder) => po.id !== context.optimisticPO.id),
              pagination: {
                ...typedOldData.pagination,
                total: typedOldData.pagination.total - 1,
              },
            });
          }
        });
      }

      toast.error(error.message || 'Failed to create purchase order');
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppActions();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderData }) =>
      PurchaseOrderService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.purchaseOrders.detail(id) });

      // Snapshot the previous value
      const previousPO = queryClient.getQueryData<PurchaseOrder>(
        queryKeys.purchaseOrders.detail(id)
      );

      // Optimistically update
      if (previousPO) {
        const updatedPO = { ...previousPO, ...data };
        queryClient.setQueryData(queryKeys.purchaseOrders.detail(id), updatedPO);
        
        // Also update list queries
        const listQueries = queryClient.getQueriesData({ 
          queryKey: queryKeys.purchaseOrders.lists() 
        });

        listQueries.forEach(([queryKey, oldData]) => {
          if (oldData) {
            const typedOldData = oldData as PaginatedResponse<PurchaseOrder>;
            queryClient.setQueryData(queryKey, {
              ...typedOldData,
              data: typedOldData.data.map((po: PurchaseOrder) =>
                po.id === id ? updatedPO : po
              ),
            });
          }
        });
      }

      return { previousPO };
    },
    onError: (error: any, { id }, context) => {
      // Rollback on error
      if (context?.previousPO) {
        queryClient.setQueryData(queryKeys.purchaseOrders.detail(id), context.previousPO);
      }
      toast.error(error.message || 'Failed to update purchase order');
    },
    onSuccess: (data, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(queryKeys.purchaseOrders.detail(id), data);
      
      addNotification({
        type: 'success',
        title: 'Purchase Order Updated',
        message: `PO ${data.poNumber} has been updated.`,
        read: false,
      });

      toast.success('Purchase order updated successfully');
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.lists() });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppActions();

  return useMutation({
    mutationFn: PurchaseOrderService.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.purchaseOrders.detail(id) });
      
      // Update list queries
      const listQueries = queryClient.getQueriesData({ 
        queryKey: queryKeys.purchaseOrders.lists() 
      });

      listQueries.forEach(([queryKey, oldData]) => {
        if (oldData) {
          const typedOldData = oldData as PaginatedResponse<PurchaseOrder>;
          queryClient.setQueryData(queryKey, {
            ...typedOldData,
            data: typedOldData.data.filter((po: PurchaseOrder) => po.id !== id),
            pagination: {
              ...typedOldData.pagination,
              total: typedOldData.pagination.total - 1,
            },
          });
        }
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.statistics() });

      addNotification({
        type: 'success',
        title: 'Purchase Order Deleted',
        message: 'The purchase order has been deleted successfully.',
        read: false,
      });

      toast.success('Purchase order deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete purchase order');
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useAppActions();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      PurchaseOrderService.approve(id, comments),
    onSuccess: (data, { id }) => {
      // Update cache
      queryClient.setQueryData(queryKeys.purchaseOrders.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.statistics() });

      addNotification({
        type: 'success',
        title: 'Purchase Order Approved',
        message: `PO ${data.poNumber} has been approved.`,
        read: false,
      });

      toast.success('Purchase order approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve purchase order');
    },
  });
}

// Export service for direct use if needed
export { PurchaseOrderService };