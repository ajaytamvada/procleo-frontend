import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface VendorOnboardingStatus {
  status: 'PENDING_REVIEW' | 'INFO_REQUESTED' | 'APPROVED' | 'REJECTED';
  approved: boolean;
  requestedFields: string[];
  requestedNote?: string;
  remarks?: string;
}

export const useVendorOnboardingStatus = () =>
  useQuery<VendorOnboardingStatus>({
    queryKey: ['vendor', 'onboarding-status'],
    queryFn: async () => {
      const response = await apiClient.get('/vendor-portal/onboarding-status');
      return response.data;
    },
  });

export const useSubmitForReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/vendor-portal/submit-for-review');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendor', 'onboarding-status'],
      });
    },
  });
};
