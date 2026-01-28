import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Types
export interface VendorDashboardData {
  vendorId: number;
  vendorName: string;
  activeRfpInvitations: number;
  pendingQuotations: number;
  submittedQuotations: number;
  purchaseOrders: number;
  pendingInvoices: number;
  submittedInvoices?: number;
  paidInvoices?: number;
}

export interface VendorRFP {
  id: number;
  rfpNumber: string;
  title: string;
  description?: string;
  department: string;
  status: string;
  closingDate: string;
  requestDate: string;
  itemCount: number;
  hasSubmittedQuotation: boolean;
  quotationStatus?: string;
  isExpired?: boolean;
  daysRemaining?: number;
}

export interface VendorProfile {
  id: number;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  state?: string;
  pinCode?: string;
  gst?: string;
  pan?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// API functions
const vendorApi = {
  getDashboard: async (): Promise<VendorDashboardData> => {
    const response = await apiClient.get('/vendor-portal/dashboard');
    return response.data;
  },

  getMyRFPs: async (): Promise<VendorRFP[]> => {
    const response = await apiClient.get('/vendor-portal/rfps');
    return response.data;
  },

  getRFPById: async (rfpId: number): Promise<VendorRFP> => {
    const response = await apiClient.get(`/vendor-portal/rfps/${rfpId}`);
    return response.data;
  },

  getMyProfile: async (): Promise<VendorProfile> => {
    const response = await apiClient.get('/vendor-portal/profile');
    return response.data;
  },
};

// Query keys
export const vendorQueryKeys = {
  dashboard: ['vendor', 'dashboard'] as const,
  rfps: ['vendor', 'rfps'] as const,
  rfp: (id: number) => ['vendor', 'rfps', id] as const,
  profile: ['vendor', 'profile'] as const,
};

// Hooks
export function useVendorDashboard() {
  return useQuery({
    queryKey: vendorQueryKeys.dashboard,
    queryFn: vendorApi.getDashboard,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useVendorRFPs() {
  return useQuery({
    queryKey: vendorQueryKeys.rfps,
    queryFn: vendorApi.getMyRFPs,
    staleTime: 30 * 1000,
  });
}

export function useVendorRFP(rfpId: number | undefined) {
  return useQuery({
    queryKey: vendorQueryKeys.rfp(rfpId!),
    queryFn: () => vendorApi.getRFPById(rfpId!),
    enabled: !!rfpId,
  });
}

export function useVendorProfile() {
  return useQuery({
    queryKey: vendorQueryKeys.profile,
    queryFn: vendorApi.getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
