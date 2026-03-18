/**
 * React Query hooks for PR Approval functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getPRsPendingApproval,
  getPRDetailsForApproval,
  approvePRItems,
} from '../services/approval.service';
import type { PRApprovalRequest } from '../types/approval.types';

/**
 * Hook to fetch PRs pending approval
 */
export const usePRsPendingApproval = (status: string = 'waiting') => {
  return useQuery({
    queryKey: ['prs-pending-approval', status],
    queryFn: () => getPRsPendingApproval(status),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch PR details for approval
 */
export const usePRDetailsForApproval = (
  prId: number | null,
  status: string = 'waiting'
) => {
  return useQuery({
    queryKey: ['pr-approval-details', prId, status],
    queryFn: () => getPRDetailsForApproval(prId!, status),
    enabled: prId !== null,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to approve/reject PR items
 */
export const useApprovePRItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      prId,
      approvalRequest,
    }: {
      prId: number;
      approvalRequest: PRApprovalRequest;
    }) => approvePRItems(prId, approvalRequest),
    onSuccess: (_, variables) => {
      const action =
        variables.approvalRequest.approvalStatus === 'Accepted'
          ? 'approved'
          : 'rejected';
      toast.success(`PR items ${action} successfully`);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['prs-pending-approval'] });
      queryClient.invalidateQueries({
        queryKey: ['pr-approval-details', variables.prId],
      });
      queryClient.invalidateQueries({ queryKey: ['pr-status'] }); // Also invalidate PR status
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to process approval. Please try again.';
      toast.error(errorMessage);
    },
  });
};
