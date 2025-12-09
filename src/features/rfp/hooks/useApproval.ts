/**
 * React Query hooks for RFP Approval functionality
 * Allows management to approve/reject finalized vendor selections
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rfpApi } from '../services/rfpApi';
import toast from 'react-hot-toast';

/**
 * Fetch RFPs waiting for approval
 */
export const useRFPsWaitingForApproval = () => {
  return useQuery({
    queryKey: ['rfps', 'waiting-for-approval'],
    queryFn: () => rfpApi.getRFPsWaitingForApproval(),
  });
};

/**
 * Approve or reject RFP
 */
export const useApproveRejectRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      rfpId: number;
      action: string;
      remarks?: string;
    }) => rfpApi.approveOrRejectRFP(request),
    onSuccess: (data, variables) => {
      const action = variables.action.toLowerCase();
      toast.success(`RFP ${action}d successfully!`);
      // Invalidate and refetch RFP queries
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to process RFP approval'
      );
    },
  });
};
