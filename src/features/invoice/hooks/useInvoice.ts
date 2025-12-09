/**
 * React Query hooks for Invoice management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createInvoice,
  updateInvoice,
  getInvoiceById,
  getInvoiceByNumber,
  getAllInvoices,
  getInvoicesByPoId,
  getInvoicesBySupplierId,
  getInvoicesByStatus,
  getDraftInvoices,
  getPendingApprovalInvoices,
  getInvoicesByDateRange,
  searchInvoices,
  deleteInvoice,
  submitInvoice,
  approveInvoice,
  rejectInvoice,
  getPOItemsForInvoicing,
  getPODetails,
  getPOsForInvoicing,
  checkInvoiceNumber,
  generateInvoiceNumber,
  createDirectInvoice,
  updateDirectInvoice,
  getAllDirectInvoices,
  getDirectDraftInvoices,
  deleteDirectInvoiceItem,
} from '../api/invoiceApi';
import type {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateDirectInvoiceRequest,
  UpdateDirectInvoiceRequest,
} from '../types';

// ========== QUERY HOOKS ==========

/**
 * Hook to fetch invoice by ID
 */
export const useInvoiceById = (id: number | null) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id!),
    enabled: id !== null,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to fetch invoice by number
 */
export const useInvoiceByNumber = (invoiceNumber: string | null) => {
  return useQuery({
    queryKey: ['invoice', 'number', invoiceNumber],
    queryFn: () => getInvoiceByNumber(invoiceNumber!),
    enabled: invoiceNumber !== null && invoiceNumber.length > 0,
    staleTime: 60000,
  });
};

/**
 * Hook to fetch all invoices
 */
export const useAllInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => getAllInvoices(),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch invoices by PO ID
 */
export const useInvoicesByPoId = (poId: number | null) => {
  return useQuery({
    queryKey: ['invoices', 'po', poId],
    queryFn: () => getInvoicesByPoId(poId!),
    enabled: poId !== null,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch invoices by supplier ID
 */
export const useInvoicesBySupplierId = (supplierId: number | null) => {
  return useQuery({
    queryKey: ['invoices', 'supplier', supplierId],
    queryFn: () => getInvoicesBySupplierId(supplierId!),
    enabled: supplierId !== null,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch invoices by status
 */
export const useInvoicesByStatus = (status: string | null) => {
  return useQuery({
    queryKey: ['invoices', 'status', status],
    queryFn: () => getInvoicesByStatus(status!),
    enabled: status !== null && status.length > 0,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch draft invoices
 */
export const useDraftInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'drafts'],
    queryFn: getDraftInvoices,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch pending approval invoices
 */
export const usePendingApprovalInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'pending-approval'],
    queryFn: getPendingApprovalInvoices,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch invoices by date range
 */
export const useInvoicesByDateRange = (
  startDate: string | null,
  endDate: string | null
) => {
  return useQuery({
    queryKey: ['invoices', 'date-range', startDate, endDate],
    queryFn: () => getInvoicesByDateRange(startDate!, endDate!),
    enabled: startDate !== null && endDate !== null,
    staleTime: 30000,
  });
};

/**
 * Hook to search invoices
 */
export const useSearchInvoices = (searchTerm: string) => {
  return useQuery({
    queryKey: ['invoices', 'search', searchTerm],
    queryFn: () => searchInvoices(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch PO items available for invoicing
 */
export const usePOItemsForInvoicing = (poId: number | null) => {
  return useQuery({
    queryKey: ['po-items', 'invoicing', poId],
    queryFn: () => getPOItemsForInvoicing(poId!),
    enabled: poId !== null,
    staleTime: 60000,
  });
};

/**
 * Hook to fetch PO details for invoice creation
 */
export const usePODetails = (poId: number | null) => {
  return useQuery({
    queryKey: ['po-details', poId],
    queryFn: () => getPODetails(poId!),
    enabled: poId !== null,
    staleTime: 60000,
  });
};

/**
 * Hook to fetch available POs for invoicing
 */
export const usePOsForInvoicing = () => {
  return useQuery({
    queryKey: ['pos', 'available-for-invoicing'],
    queryFn: getPOsForInvoicing,
    staleTime: 30000,
  });
};

/**
 * Hook to check if invoice number exists
 */
export const useCheckInvoiceNumber = (invoiceNumber: string | null) => {
  return useQuery({
    queryKey: ['invoice', 'check-number', invoiceNumber],
    queryFn: () => checkInvoiceNumber(invoiceNumber!),
    enabled: invoiceNumber !== null && invoiceNumber.length > 0,
    staleTime: 0, // Don't cache this
  });
};

/**
 * Hook to generate invoice number
 */
export const useGenerateInvoiceNumber = () => {
  return useQuery({
    queryKey: ['invoice', 'generate-number'],
    queryFn: generateInvoiceNumber,
    staleTime: 0, // Always fetch fresh
  });
};

/**
 * Hook to fetch all direct invoices
 */
export const useAllDirectInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'direct'],
    queryFn: getAllDirectInvoices,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch direct draft invoices
 */
export const useDirectDraftInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'direct', 'drafts'],
    queryFn: getDirectDraftInvoices,
    staleTime: 30000,
  });
};

// ========== MUTATION HOOKS ==========

/**
 * Hook to create invoice from PO
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInvoiceRequest) => createInvoice(request),
    onSuccess: () => {
      toast.success('Invoice created successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to create invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update invoice
 */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateInvoiceRequest;
    }) => updateInvoice(id, request),
    onSuccess: (_, variables) => {
      toast.success('Invoice updated successfully');

      // Invalidate specific invoice and list queries
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete invoice
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast.success('Invoice deleted successfully');

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to submit invoice for approval
 */
export const useSubmitInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitInvoice,
    onSuccess: (_, id) => {
      toast.success('Invoice submitted for approval');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
      queryClient.invalidateQueries({
        queryKey: ['invoices', 'pending-approval'],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to submit invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to approve invoice
 */
export const useApproveInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveInvoice,
    onSuccess: (_, id) => {
      toast.success('Invoice approved successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({
        queryKey: ['invoices', 'pending-approval'],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to approve invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to reject invoice
 */
export const useRejectInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks: string }) =>
      rejectInvoice(id, remarks),
    onSuccess: (_, variables) => {
      toast.success('Invoice rejected');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({
        queryKey: ['invoices', 'pending-approval'],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reject invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to create direct invoice
 */
export const useCreateDirectInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDirectInvoiceRequest) =>
      createDirectInvoice(request),
    onSuccess: () => {
      toast.success('Direct invoice created successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'direct'] });
      queryClient.invalidateQueries({
        queryKey: ['invoices', 'direct', 'drafts'],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to create direct invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to update direct invoice
 */
export const useUpdateDirectInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateDirectInvoiceRequest;
    }) => updateDirectInvoice(id, request),
    onSuccess: (_, variables) => {
      toast.success('Direct invoice updated successfully');

      // Invalidate specific invoice and list queries
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'direct'] });
      queryClient.invalidateQueries({
        queryKey: ['invoices', 'direct', 'drafts'],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update direct invoice. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete direct invoice item
 */
export const useDeleteDirectInvoiceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDirectInvoiceItem,
    onSuccess: () => {
      toast.success('Invoice item deleted successfully');

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'direct'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete invoice item. Please try again.';
      toast.error(errorMessage);
    },
  });
};
