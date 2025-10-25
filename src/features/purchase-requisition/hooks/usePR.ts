/**
 * React Query hooks for Purchase Requisition management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAllDrafts,
  getAllSubmitted,
  getPRById,
  deletePR,
  deletePRs,
} from '../services/pr.service';

/**
 * Hook to fetch all draft PRs
 */
export const useAllDrafts = () => {
  return useQuery({
    queryKey: ['pr-drafts'],
    queryFn: getAllDrafts,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch all submitted PRs
 */
export const useAllSubmitted = () => {
  return useQuery({
    queryKey: ['pr-submitted'],
    queryFn: getAllSubmitted,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch PR by ID
 */
export const usePRById = (id: number | null) => {
  return useQuery({
    queryKey: ['pr', id],
    queryFn: () => getPRById(id!),
    enabled: id !== null,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to delete a single PR
 */
export const useDeletePR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePR,
    onSuccess: () => {
      toast.success('Purchase requisition deleted successfully');

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['pr-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['pr-submitted'] });
      queryClient.invalidateQueries({ queryKey: ['pr-status'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete purchase requisition. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to delete multiple PRs
 */
export const useDeletePRs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePRs,
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} purchase requisition(s) deleted successfully`);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['pr-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['pr-submitted'] });
      queryClient.invalidateQueries({ queryKey: ['pr-status'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete purchase requisitions. Please try again.';
      toast.error(errorMessage);
    },
  });
};
