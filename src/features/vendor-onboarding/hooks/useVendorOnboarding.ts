import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

/** Vendor record as returned by the onboarding endpoints (VendorDto). */
export interface OnboardingVendor {
  id: number;
  name: string;
  code?: string;
  email?: string;
  legalForm?: string;
  webLink?: string;
  gst?: string;
  pan?: string;
  cin?: string;
  dunsNo?: string;
  industry?: string;
  businessDescription?: string;
  address1?: string;
  address2?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  mobileNo?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactPhone?: string;
  onboardingStatus?: string;
  requestedInfoFields?: string;
  requestedInfoNote?: string;
  approvalRemarks?: string;
  reviewedBy?: number;
  supplierCategoryIds?: string;
  // Uploaded document filenames (downloadable via /files/download/{name})
  gstFilePath?: string;
  panFilePath?: string;
  tdsFilePath?: string;
  msmeFilePath?: string;
  isoFilePath?: string;
  incorporationFilePath?: string;
  // Allow indexed access by requested-field key
  [key: string]: unknown;
}

export interface ApprovalPayload {
  remarks?: string;
  reviewedBy?: number;
  /** Supplier group to assign on approval (M_Supplier_Category id). Required for approve. */
  supplierCategoryIds?: string;
}

export interface RequestInfoPayload {
  requestedFields: string[];
  note?: string;
  reviewedBy?: number;
}

const onboardingAPI = {
  getQueue: async (status: string): Promise<OnboardingVendor[]> => {
    const response = await apiClient.get('/vendor-onboarding/queue', {
      params: { status },
    });
    return Array.isArray(response.data) ? response.data : [];
  },
  getDetail: async (id: number): Promise<OnboardingVendor> => {
    const response = await apiClient.get(`/vendor-onboarding/${id}`);
    return response.data;
  },
  approve: async (id: number, payload: ApprovalPayload) => {
    const response = await apiClient.post(
      `/vendor-onboarding/${id}/approve`,
      payload
    );
    return response.data;
  },
  reject: async (id: number, payload: ApprovalPayload) => {
    const response = await apiClient.post(
      `/vendor-onboarding/${id}/reject`,
      payload
    );
    return response.data;
  },
  requestInfo: async (id: number, payload: RequestInfoPayload) => {
    const response = await apiClient.post(
      `/vendor-onboarding/${id}/request-info`,
      payload
    );
    return response.data;
  },
};

export const useOnboardingQueue = (status: string) =>
  useQuery<OnboardingVendor[]>({
    queryKey: ['vendor-onboarding', 'queue', status],
    queryFn: () => onboardingAPI.getQueue(status),
  });

export const useOnboardingDetail = (id: number) =>
  useQuery<OnboardingVendor>({
    queryKey: ['vendor-onboarding', 'detail', id],
    queryFn: () => onboardingAPI.getDetail(id),
    enabled: !!id,
  });

const useInvalidateOnboarding = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ['vendor-onboarding'] });
};

export const useApproveVendor = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApprovalPayload }) =>
      onboardingAPI.approve(id, payload),
    onSuccess: invalidate,
  });
};

export const useRejectVendor = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApprovalPayload }) =>
      onboardingAPI.reject(id, payload),
    onSuccess: invalidate,
  });
};

export const useRequestVendorInfo = () => {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: RequestInfoPayload;
    }) => onboardingAPI.requestInfo(id, payload),
    onSuccess: invalidate,
  });
};

export default onboardingAPI;
