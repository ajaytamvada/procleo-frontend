/**
 * React Query hooks for RFP Summary functionality
 */

import { useQuery } from '@tanstack/react-query';
import { rfpApi } from '../services/rfpApi';

/**
 * Fetch RFPs for summary (completed/approved RFPs)
 */
export const useRFPsForSummary = () => {
  return useQuery({
    queryKey: ['rfps', 'for-summary'],
    queryFn: async () => {
      // Fetch RFPs that have quotations (any status that has moved past quotation stage)
      const response = await rfpApi.getRFPsByStatus('QUOTATION_RECEIVED');
      return response.filter((rfp) => rfp.quotations && rfp.quotations.length > 0);
    },
  });
};

/**
 * Fetch comprehensive RFP summary
 */
export const useRFPSummary = (rfpId: number) => {
  return useQuery({
    queryKey: ['rfp', 'summary', rfpId],
    queryFn: () => rfpApi.getRFPSummary(rfpId),
    enabled: !!rfpId,
  });
};
