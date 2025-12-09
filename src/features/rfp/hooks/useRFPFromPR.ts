/**
 * React Query hooks for Create RFP from Approved PRs workflow
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getApprovedPRsForRFPCreation,
  getApprovedPRItemsForRFPCreation,
  createRFPFromPRs,
} from '../services/rfpFromPRApi';
import type { CreateRFPFromPRsRequest } from '../types/rfpFromPR';

/**
 * Hook to fetch approved PRs for RFP creation
 */
export const useApprovedPRsForRFPCreation = (searchWord?: string) => {
  return useQuery({
    queryKey: ['approved-prs-for-rfp', searchWord],
    queryFn: () => getApprovedPRsForRFPCreation(searchWord),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch approved PR items for selected PR IDs
 */
export const useApprovedPRItemsForRFPCreation = (
  prIds: number[],
  enabled = true
) => {
  return useQuery({
    queryKey: ['approved-pr-items-for-rfp', prIds],
    queryFn: () => getApprovedPRItemsForRFPCreation(prIds),
    enabled: enabled && prIds.length > 0,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to create RFP from approved PRs
 */
export const useCreateRFPFromPRs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRFPFromPRsRequest) => createRFPFromPRs(request),
    onSuccess: data => {
      toast.success(`RFP ${data.rfpNumber} created successfully!`);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['approved-prs-for-rfp'] });
      queryClient.invalidateQueries({
        queryKey: ['approved-pr-items-for-rfp'],
      });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to create RFP from PRs';
      toast.error(errorMessage);
    },
  });
};
