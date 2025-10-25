import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { purchaseOrderApi } from '../api/purchaseOrderApi';
import type { PurchaseOrder } from '../types';

// Query keys
const PURCHASE_ORDER_KEYS = {
  all: ['purchaseOrders'] as const,
  lists: () => [...PURCHASE_ORDER_KEYS.all, 'list'] as const,
  list: (status?: string) => [...PURCHASE_ORDER_KEYS.lists(), status] as const,
  details: () => [...PURCHASE_ORDER_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PURCHASE_ORDER_KEYS.details(), id] as const,
  byNumber: (poNumber: string) => [...PURCHASE_ORDER_KEYS.all, 'number', poNumber] as const,
  approvedRFPs: () => [...PURCHASE_ORDER_KEYS.all, 'approved-rfps'] as const,
  generateNumber: () => [...PURCHASE_ORDER_KEYS.all, 'generate-number'] as const,
};

// Get all purchase orders
export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: PURCHASE_ORDER_KEYS.lists(),
    queryFn: () => purchaseOrderApi.getAllPurchaseOrders(),
    staleTime: 30000, // 30 seconds
  });
};

// Get purchase order by ID
export const usePurchaseOrder = (id: number) => {
  return useQuery({
    queryKey: PURCHASE_ORDER_KEYS.detail(id),
    queryFn: () => purchaseOrderApi.getPurchaseOrderById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
};

// Get purchase order by PO number
export const usePurchaseOrderByNumber = (poNumber: string) => {
  return useQuery({
    queryKey: PURCHASE_ORDER_KEYS.byNumber(poNumber),
    queryFn: () => purchaseOrderApi.getPurchaseOrderByNumber(poNumber),
    enabled: !!poNumber,
    staleTime: 60000, // 1 minute
  });
};

// Get POs by status
export const usePurchaseOrdersByStatus = (status: string) => {
  return useQuery({
    queryKey: PURCHASE_ORDER_KEYS.list(status),
    queryFn: () => purchaseOrderApi.getPurchaseOrdersByStatus(status),
    enabled: !!status,
    staleTime: 30000, // 30 seconds
  });
};

// Get POs by supplier
export const usePurchaseOrdersBySupplierId = (supplierId: number) => {
  return useQuery({
    queryKey: [...PURCHASE_ORDER_KEYS.all, 'supplier', supplierId],
    queryFn: () => purchaseOrderApi.getPurchaseOrdersBySupplierId(supplierId),
    enabled: !!supplierId,
    staleTime: 30000, // 30 seconds
  });
};

// Search purchase orders
export const useSearchPurchaseOrders = (searchTerm: string) => {
  return useQuery({
    queryKey: [...PURCHASE_ORDER_KEYS.all, 'search', searchTerm],
    queryFn: () => purchaseOrderApi.searchPurchaseOrders(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 30000, // 30 seconds
  });
};

// Get POs by date range
export const usePurchaseOrdersByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: [...PURCHASE_ORDER_KEYS.all, 'dateRange', startDate, endDate],
    queryFn: () => purchaseOrderApi.getPurchaseOrdersByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 30000, // 30 seconds
  });
};

// Get approved RFPs ready for PO creation
export const useApprovedRFPsForPOCreation = () => {
  return useQuery({
    queryKey: PURCHASE_ORDER_KEYS.approvedRFPs(),
    queryFn: () => purchaseOrderApi.getApprovedRFPsForPOCreation(),
    staleTime: 30000, // 30 seconds
  });
};

// Generate PO number
export const useGeneratePONumber = () => {
  return useQuery({
    queryKey: PURCHASE_ORDER_KEYS.generateNumber(),
    queryFn: () => purchaseOrderApi.generatePONumber(),
    staleTime: 0, // Always fetch fresh PO number
  });
};

// Create purchase order
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PurchaseOrder>) => purchaseOrderApi.createPurchaseOrder(data),
    onSuccess: () => {
      toast.success('Purchase Order created successfully');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create purchase order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Create PO from approved RFP
export const useCreatePOFromRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpId, data }: { rfpId: number; data: Partial<PurchaseOrder> }) =>
      purchaseOrderApi.createPOFromRFP(rfpId, data),
    onSuccess: () => {
      toast.success('Purchase Order created from RFP successfully');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.approvedRFPs() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create PO from RFP. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Update purchase order
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PurchaseOrder> }) =>
      purchaseOrderApi.updatePurchaseOrder(id, data),
    onSuccess: (_, variables) => {
      toast.success('Purchase Order updated successfully');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update purchase order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Delete purchase order
export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderApi.deletePurchaseOrder(id),
    onSuccess: () => {
      toast.success('Purchase Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete purchase order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Submit PO for approval
export const useSubmitPOForApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchaseOrderApi.submitForApproval(id),
    onSuccess: (_, id) => {
      toast.success('Purchase Order submitted for approval');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit PO for approval. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Approve purchase order
export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: number; approvedBy: string }) =>
      purchaseOrderApi.approvePurchaseOrder(id, approvedBy),
    onSuccess: (_, variables) => {
      toast.success('Purchase Order approved successfully');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to approve purchase order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Reject purchase order
export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseOrderApi.rejectPurchaseOrder(id, reason),
    onSuccess: (_, variables) => {
      toast.success('Purchase Order rejected');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to reject purchase order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Cancel purchase order
export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseOrderApi.cancelPurchaseOrder(id, reason),
    onSuccess: (_, variables) => {
      toast.success('Purchase Order cancelled');
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PURCHASE_ORDER_KEYS.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to cancel purchase order. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Export PO to PDF
export const useExportPOToPdf = () => {
  return useMutation({
    mutationFn: (id: number) => purchaseOrderApi.exportPOToPdf(id),
    onSuccess: (blob, id) => {
      // Create blob and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PO_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PO exported successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to export PO to PDF. Please try again.';
      toast.error(errorMessage);
    },
  });
};