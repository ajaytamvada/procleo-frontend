/**
 * React Query hooks for Re-Submit Quotation operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rfpApi } from '../services/rfpApi';
import type { RFPQuotation } from '../types';

/**
 * Hook to get submitted quotations (for re-submission/modification)
 * Filters RFPs that have quotations with SUBMITTED or NEGOTIATION status
 */
export const useSubmittedQuotations = () => {
  return useQuery({
    queryKey: ['rfps', 'submitted-quotations'],
    queryFn: async () => {
      // Get all FLOATED RFPs
      const rfps = await rfpApi.getRFPsByStatus('FLOATED');

      // Filter to only RFPs with submitted quotations
      const rfpsWithQuotations = rfps.filter(rfp =>
        rfp.quotations && rfp.quotations.length > 0
      );

      return rfpsWithQuotations;
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get specific quotation details for editing
 */
export const useQuotationForEdit = (rfpId: number, quotationId: number) => {
  return useQuery({
    queryKey: ['rfp', 'quotation', rfpId, quotationId],
    queryFn: async () => {
      const rfp = await rfpApi.getRFPById(rfpId);

      // Find the specific quotation
      const quotation = rfp.quotations?.find(q => q.id === quotationId);

      if (!quotation) {
        throw new Error('Quotation not found');
      }

      return { rfp, quotation };
    },
    enabled: !!rfpId && !!quotationId,
  });
};

/**
 * Hook to update (re-submit) a quotation
 */
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfpId,
      quotationId,
      quotation
    }: {
      rfpId: number;
      quotationId: number;
      quotation: RFPQuotation
    }) => rfpApi.updateQuotation(rfpId, quotationId, quotation),
    onSuccess: (data, variables) => {
      const quotationNumber = data.quotations?.find(q => q.id === variables.quotationId)?.quotationNumber;
      toast.success(`Quotation ${quotationNumber} updated successfully!`);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'submitted-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['rfp', 'quotation', variables.rfpId, variables.quotationId] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update quotation';
      toast.error(errorMessage);
    },
  });
};
