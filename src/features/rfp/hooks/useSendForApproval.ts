/**
 * React Query hooks for Send For Approval functionality
 * Allows finalizing vendor selection and sending for management approval
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rfpApi } from '../services/rfpApi';
import toast from 'react-hot-toast';

/**
 * Fetch RFPs ready for finalization (with submitted quotations)
 */
export const useRFPsForFinalization = () => {
  return useQuery({
    queryKey: ['rfps', 'finalization'],
    queryFn: async () => {
      // Get RFPs with QUOTATION_RECEIVED status
      const response = await rfpApi.getRFPsByStatus('FLOATED,NEGOTIATION,UNDER_EVALUATION');
      // Filter to only include RFPs with quotations
      return response.filter(
        rfp => rfp.quotations && rfp.quotations.length > 0
      );
    },
  });
};

/**
 * Send RFP for approval with vendor selections
 */
export const useSendForApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => rfpApi.sendForApproval(request),
    onSuccess: data => {
      toast.success('RFP sent for approval successfully!');
      // Invalidate and refetch RFP queries
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to send RFP for approval'
      );
    },
  });
};
