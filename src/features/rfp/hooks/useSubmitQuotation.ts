/**
 * React Query hooks for Submit Quotation operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rfpApi } from '../services/rfpApi';
import type { RFPQuotation } from '../types';

/**
 * Hook to get RFPs floated to suppliers (for quotation submission)
 */
export const useFloatedRFPs = () => {
  return useQuery({
    queryKey: ['rfps', 'floated'],
    queryFn: () => rfpApi.getRFPsByStatus('FLOATED'),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get RFP details for quotation
 */
export const useRFPForQuotation = (rfpId: number) => {
  return useQuery({
    queryKey: ['rfp', 'quotation', rfpId],
    queryFn: () => rfpApi.getRFPById(rfpId),
    enabled: !!rfpId,
  });
};

/**
 * Hook to submit quotation
 */
export const useSubmitQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfpId,
      quotation,
    }: {
      rfpId: number;
      quotation: RFPQuotation;
    }) => rfpApi.submitQuotation(rfpId, quotation),
    onSuccess: data => {
      toast.success(
        `Quotation ${data.quotations?.[data.quotations.length - 1]?.quotationNumber} submitted successfully!`
      );
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'floated'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to submit quotation';
      toast.error(errorMessage);
    },
  });
};
