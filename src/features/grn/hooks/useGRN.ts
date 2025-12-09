import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createGRN,
  updateGRN,
  deleteGRN,
  submitGRN,
  approveGRN,
  rejectGRN,
  getGRNById,
  getGRNByNumber,
  getAllGRNs,
  getGRNsByPoId,
  getGRNsByPoNumber,
  getGRNsBySupplierId,
  getGRNsByStatus,
  getDraftGRNs,
  getPendingApprovalGRNs,
  getApprovedGRNs,
  getRejectedGRNs,
  getGRNsByDateRange,
  searchGRNs,
  getInvoicesForGRN,
  getInvoiceDetailsForGRN,
  checkGRNNumber,
  generateGRNNumber,
  getGRNsWithoutInvoice,
  getGRNsByInvoiceNumber,
  getGRNsByQualityCheckStatus,
} from '../api/grnApi';
import type {
  CreateGRNRequest,
  UpdateGRNRequest,
  ApproveGRNRequest,
} from '../types';

// ========== QUERY HOOKS ==========

export const useGRNById = (id: number | null) => {
  return useQuery({
    queryKey: ['grns', id],
    queryFn: () => getGRNById(id!),
    enabled: id !== null,
    staleTime: 30000,
  });
};

export const useGRNByNumber = (grnNumber: string | null) => {
  return useQuery({
    queryKey: ['grns', 'number', grnNumber],
    queryFn: () => getGRNByNumber(grnNumber!),
    enabled: grnNumber !== null && grnNumber.length > 0,
    staleTime: 30000,
  });
};

export const useAllGRNs = () => {
  return useQuery({
    queryKey: ['grns'],
    queryFn: () => getAllGRNs(),
    staleTime: 60000,
  });
};

export const useGRNsByPoId = (poId: number | null) => {
  return useQuery({
    queryKey: ['grns', 'po', poId],
    queryFn: () => getGRNsByPoId(poId!),
    enabled: poId !== null,
    staleTime: 60000,
  });
};

export const useGRNsByPoNumber = (poNumber: string | null) => {
  return useQuery({
    queryKey: ['grns', 'po', 'number', poNumber],
    queryFn: () => getGRNsByPoNumber(poNumber!),
    enabled: poNumber !== null && poNumber.length > 0,
    staleTime: 60000,
  });
};

export const useGRNsBySupplierId = (supplierId: number | null) => {
  return useQuery({
    queryKey: ['grns', 'supplier', supplierId],
    queryFn: () => getGRNsBySupplierId(supplierId!),
    enabled: supplierId !== null,
    staleTime: 60000,
  });
};

export const useGRNsByStatus = (status: string | null) => {
  return useQuery({
    queryKey: ['grns', 'status', status],
    queryFn: () => getGRNsByStatus(status!),
    enabled: status !== null && status.length > 0,
    staleTime: 60000,
  });
};

export const useDraftGRNs = () => {
  return useQuery({
    queryKey: ['grns', 'drafts'],
    queryFn: () => getDraftGRNs(),
    staleTime: 30000,
  });
};

export const usePendingApprovalGRNs = () => {
  return useQuery({
    queryKey: ['grns', 'pending-approval'],
    queryFn: () => getPendingApprovalGRNs(),
    staleTime: 30000,
  });
};

export const useApprovedGRNs = () => {
  return useQuery({
    queryKey: ['grns', 'approved'],
    queryFn: () => getApprovedGRNs(),
    staleTime: 60000,
  });
};

export const useRejectedGRNs = () => {
  return useQuery({
    queryKey: ['grns', 'rejected'],
    queryFn: () => getRejectedGRNs(),
    staleTime: 60000,
  });
};

export const useGRNsByDateRange = (
  startDate: string | null,
  endDate: string | null
) => {
  return useQuery({
    queryKey: ['grns', 'date-range', startDate, endDate],
    queryFn: () => getGRNsByDateRange(startDate!, endDate!),
    enabled: startDate !== null && endDate !== null,
    staleTime: 60000,
  });
};

export const useSearchGRNs = (searchTerm: string) => {
  return useQuery({
    queryKey: ['grns', 'search', searchTerm],
    queryFn: () => searchGRNs(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 30000,
  });
};

export const useInvoicesForGRN = () => {
  return useQuery({
    queryKey: ['invoices', 'for-grn'],
    queryFn: () => getInvoicesForGRN(),
    staleTime: 60000,
  });
};

export const useInvoiceDetailsForGRN = (invoiceId: number | null) => {
  return useQuery({
    queryKey: ['invoices', 'for-grn', invoiceId],
    queryFn: () => getInvoiceDetailsForGRN(invoiceId!),
    enabled: invoiceId !== null,
    staleTime: 60000,
  });
};

export const useCheckGRNNumber = (grnNumber: string) => {
  return useQuery({
    queryKey: ['grns', 'check-number', grnNumber],
    queryFn: () => checkGRNNumber(grnNumber),
    enabled: grnNumber.length > 0,
    staleTime: 0,
  });
};

export const useGenerateGRNNumber = () => {
  return useQuery({
    queryKey: ['grns', 'generate-number'],
    queryFn: () => generateGRNNumber(),
    staleTime: 0,
  });
};

export const useGRNsWithoutInvoice = () => {
  return useQuery({
    queryKey: ['grns', 'without-invoice'],
    queryFn: () => getGRNsWithoutInvoice(),
    staleTime: 60000,
  });
};

export const useGRNsByInvoiceNumber = (invoiceNumber: string | null) => {
  return useQuery({
    queryKey: ['grns', 'invoice', invoiceNumber],
    queryFn: () => getGRNsByInvoiceNumber(invoiceNumber!),
    enabled: invoiceNumber !== null && invoiceNumber.length > 0,
    staleTime: 60000,
  });
};

export const useGRNsByQualityCheckStatus = (status: string | null) => {
  return useQuery({
    queryKey: ['grns', 'quality-check', status],
    queryFn: () => getGRNsByQualityCheckStatus(status!),
    enabled: status !== null && status.length > 0,
    staleTime: 60000,
  });
};

// ========== MUTATION HOOKS ==========

export const useCreateGRN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateGRNRequest) => createGRN(request),
    onSuccess: () => {
      toast.success('GRN created successfully');
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'for-grn'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to create GRN. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateGRN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateGRNRequest }) =>
      updateGRN(id, request),
    onSuccess: data => {
      toast.success('GRN updated successfully');
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['grns', data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update GRN. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteGRN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGRN(id),
    onSuccess: () => {
      toast.success('GRN deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'for-grn'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete GRN. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useSubmitGRN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => submitGRN(id),
    onSuccess: data => {
      toast.success('GRN submitted for approval successfully');
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['grns', data.id] });
      queryClient.invalidateQueries({ queryKey: ['grns', 'drafts'] });
      queryClient.invalidateQueries({ queryKey: ['grns', 'pending-approval'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to submit GRN. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useApproveGRN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: ApproveGRNRequest }) =>
      approveGRN(id, request),
    onSuccess: data => {
      toast.success('GRN approved successfully');
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['grns', data.id] });
      queryClient.invalidateQueries({ queryKey: ['grns', 'pending-approval'] });
      queryClient.invalidateQueries({ queryKey: ['grns', 'approved'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to approve GRN. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useRejectGRN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: ApproveGRNRequest }) =>
      rejectGRN(id, request),
    onSuccess: data => {
      toast.success('GRN rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['grns', data.id] });
      queryClient.invalidateQueries({ queryKey: ['grns', 'pending-approval'] });
      queryClient.invalidateQueries({ queryKey: ['grns', 'rejected'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'for-grn'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reject GRN. Please try again.';
      toast.error(errorMessage);
    },
  });
};
