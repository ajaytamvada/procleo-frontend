/**
 * React Query hooks for Preview Quotation functionality
 * Fetches negotiated quotations for preview and print
 */

import { useQuery } from '@tanstack/react-query';
import { rfpApi } from '../services/rfpApi';

/**
 * Fetch all RFPs with negotiated quotations for preview
 */
export const useNegotiatedQuotations = () => {
  return useQuery({
    queryKey: ['rfps', 'negotiated'],
    queryFn: async () => {
      const response = await rfpApi.getRFPsByStatus('NEGOTIATION');
      // Filter to only include RFPs with negotiated quotations
      return response.filter(rfp =>
        rfp.quotations?.some(q => q.status === 'NEGOTIATION')
      );
    },
  });
};

/**
 * Fetch specific quotation details for preview
 */
export const useQuotationPreview = (quotationId: number) => {
  return useQuery({
    queryKey: ['quotation', 'preview', quotationId],
    queryFn: () => rfpApi.getQuotationDetails(quotationId),
    enabled: !!quotationId,
  });
};
