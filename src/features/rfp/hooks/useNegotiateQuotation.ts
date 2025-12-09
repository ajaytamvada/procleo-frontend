/**
 * React Query hooks for Quotation Negotiation and Evaluation operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rfpApi } from '../services/rfpApi';

/**
 * Hook to get RFPs with submitted quotations (for evaluation/comparison)
 * Filters to only RFPs that have quotations with SUBMITTED or NEGOTIATION status
 */
export const useRFPsForEvaluation = () => {
  return useQuery({
    queryKey: ['rfps', 'for-evaluation'],
    queryFn: async () => {
      // Get all FLOATED and NEGOTIATION RFPs
      const rfps = await rfpApi.getRFPsByStatus('FLOATED,NEGOTIATION');

      // Filter to only RFPs with submitted quotations
      const rfpsWithQuotations = rfps.filter(
        rfp => rfp.quotations && rfp.quotations.length > 0
      );

      return rfpsWithQuotations;
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get RFP with all quotations for comparison
 */
export const useRFPForComparison = (rfpId: number) => {
  return useQuery({
    queryKey: ['rfp', 'comparison', rfpId],
    queryFn: async () => {
      const rfp = await rfpApi.getRFPById(rfpId);

      // Ensure we have quotations
      if (!rfp.quotations || rfp.quotations.length === 0) {
        throw new Error('No quotations found for this RFP');
      }

      return rfp;
    },
    enabled: !!rfpId,
  });
};

/**
 * Hook to negotiate a quotation (request vendor to re-submit with better pricing)
 */
export const useNegotiateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quotationId,
      negotiationNotes,
    }: {
      quotationId: number;
      negotiationNotes?: string;
    }) => rfpApi.negotiateQuotation(quotationId, negotiationNotes),
    onSuccess: data => {
      const quotation = data.quotations?.find(q => q.status === 'NEGOTIATION');
      toast.success(
        `Quotation ${quotation?.quotationNumber} marked for negotiation. Vendor will be notified.`
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'for-evaluation'] });
      queryClient.invalidateQueries({ queryKey: ['rfp', 'comparison'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to mark quotation for negotiation';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to evaluate quotations for an RFP
 */
export const useEvaluateQuotations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rfpId: number) => rfpApi.evaluateQuotations(rfpId),
    onSuccess: data => {
      toast.success(
        `Quotations evaluated successfully for RFP ${data.rfpNumber}`
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to evaluate quotations';
      toast.error(errorMessage);
    },
  });
};
