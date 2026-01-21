import { useQuery } from '@tanstack/react-query';
import { rfpApi, RfpInsight } from '../services/rfpApi';

export const useRfpInsights = (rfpId: number) => {
  return useQuery({
    queryKey: ['rfpInsights', rfpId],
    queryFn: () => rfpApi.getRfpInsights(rfpId),
    enabled: !!rfpId,
    retry: false,
  });
};
