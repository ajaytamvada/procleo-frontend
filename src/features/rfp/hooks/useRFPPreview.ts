/**
 * React Query hooks for RFP Preview operations
 */

import { useQuery } from '@tanstack/react-query';
import { rfpApi } from '../services/rfpApi';
import { companyApi } from '@/services/companyApi';

/**
 * Hook to get RFP by ID for preview
 */
export const useRFPForPreview = (rfpId: number) => {
  return useQuery({
    queryKey: ['rfp', 'preview', rfpId],
    queryFn: () => rfpApi.getRFPById(rfpId),
    enabled: !!rfpId,
  });
};

/**
 * Hook to get all active companies (for company logo/details)
 */
export const useCompanyInfo = () => {
  return useQuery({
    queryKey: ['companies', 'active'],
    queryFn: () => companyApi.getAllActiveCompanies(),
    staleTime: 60 * 60 * 1000, // 1 hour - company info doesn't change often
    select: (data) => data && data.length > 0 ? data[0] : null, // Get first active company
  });
};

/**
 * Hook to get RFPs by status (for listing floated RFPs)
 */
export const useRFPsByStatus = (status: string) => {
  return useQuery({
    queryKey: ['rfps', 'status', status],
    queryFn: () => rfpApi.getRFPsByStatus(status),
    staleTime: 30000, // 30 seconds
  });
};
