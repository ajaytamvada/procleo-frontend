import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

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
  pendingContracts?: number;
}

export interface VendorContract {
  id: number;
  contractNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  vendorAcceptanceStatus: string;
  totalValue: number;
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
  items?: VendorRFPItem[];
}

export interface VendorRFPItem {
  id: number;
  itemName: string;
  itemCode?: string;
  quantity: number;
  uom?: string;
  description?: string;
  requiredDate?: string;
}

export interface VendorQuotation {
  id: number;
  quotationNumber: string;
  rfpId: number;
  rfpNumber: string;
  rfpTitle?: string;
  status: string;
  totalAmount: number;
  netAmount: number;
  submittedDate: string;
  quotationDate?: string;
  isSelected?: boolean;
  negotiationNotes?: string;
  itemCount: number;
}

export interface VendorQuotationDetail {
  id: number;
  quotationNumber: string;
  quotationDate?: string;
  rfpId: number;
  rfpNumber: string;
  status: string;
  paymentTerms?: string;
  remarks?: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  negotiationNotes?: string;
  isSelected?: boolean;
  items: VendorQuotationItem[];
}

export interface VendorQuotationItem {
  id?: number;
  rfpItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  totalPrice: number;
  remarks?: string;
}

export interface SubmitQuotationData {
  quotationNumber?: string;
  quotationDate?: string;
  paymentTerms?: string;
  remarks?: string;
  currency?: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  items: {
    rfpItemId: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalPrice: number;
    remarks?: string;
  }[];
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

export interface VendorInvoiceItem {
  poItemId: number;
  poId: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  poQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  unitOfMeasurement?: string;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  otherTaxRate?: number;
}

export interface VendorCreateInvoiceRequest {
  poId: number;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: number;
  remarks?: string;
  items: {
    poItemId: number;
    invoiceQuantity: number;
    unitPrice: number;
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;
    otherTaxRate?: number;
    remarks?: string;
  }[];
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

  getMyQuotations: async (): Promise<VendorQuotation[]> => {
    const response = await apiClient.get('/vendor-portal/quotations');
    return response.data;
  },

  getQuotationById: async (
    quotationId: number
  ): Promise<VendorQuotationDetail> => {
    const response = await apiClient.get(
      `/vendor-portal/quotations/${quotationId}`
    );
    return response.data;
  },

  submitQuotation: async (
    rfpId: number,
    data: SubmitQuotationData
  ): Promise<{
    id: number;
    quotationNumber: string;
    status: string;
    message: string;
  }> => {
    const response = await apiClient.post(
      `/vendor-portal/rfps/${rfpId}/quotation`,
      data
    );
    return response.data;
  },

  resubmitQuotation: async (
    quotationId: number,
    data: SubmitQuotationData
  ): Promise<{
    id: number;
    quotationNumber: string;
    status: string;
    message: string;
  }> => {
    const response = await apiClient.put(
      `/vendor-portal/quotations/${quotationId}`,
      data
    );
    return response.data;
  },

  getPOItemsForInvoicing: async (
    orderId: number
  ): Promise<VendorInvoiceItem[]> => {
    const response = await apiClient.get(
      `/vendor-portal/orders/${orderId}/items-for-invoicing`
    );
    return response.data;
  },

  createInvoice: async (
    data: VendorCreateInvoiceRequest
  ): Promise<{ id: number; invoiceNumber: string; message: string }> => {
    const response = await apiClient.post('/vendor-portal/invoices', data);
    return response.data;
  },

  getMyContracts: async (): Promise<VendorContract[]> => {
    const response = await apiClient.get('/vendor-portal/contracts');
    return response.data;
  },

  acknowledgeContract: async (id: number, status: string, remarks?: string): Promise<void> => {
    await apiClient.post(`/vendor-portal/contracts/${id}/acknowledge`, null, {
      params: { status, remarks }
    });
  },
};

// Query keys
export const vendorQueryKeys = {
  dashboard: ['vendor', 'dashboard'] as const,
  rfps: ['vendor', 'rfps'] as const,
  rfp: (id: number) => ['vendor', 'rfps', id] as const,
  profile: ['vendor', 'profile'] as const,
  quotations: ['vendor', 'quotations'] as const,
  quotation: (id: number) => ['vendor', 'quotations', id] as const,
  orders: ['vendor', 'orders'] as const,
  order: (id: number) => ['vendor', 'orders', id] as const,
  poItemsForInvoicing: (id: number) =>
    ['vendor', 'orders', id, 'items-for-invoicing'] as const,
  contracts: ['vendor', 'contracts'] as const,
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

export function useVendorQuotations() {
  return useQuery({
    queryKey: vendorQueryKeys.quotations,
    queryFn: vendorApi.getMyQuotations,
    staleTime: 30 * 1000,
  });
}

export function useVendorQuotation(quotationId: number | undefined) {
  return useQuery({
    queryKey: vendorQueryKeys.quotation(quotationId!),
    queryFn: () => vendorApi.getQuotationById(quotationId!),
    enabled: !!quotationId,
  });
}

export function useVendorOrder(orderId: number | undefined) {
  return useQuery({
    queryKey: vendorQueryKeys.order(orderId!),
    queryFn: async () => {
      const response = await apiClient.get(`/vendor-portal/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
}

export function useVendorPOItemsForInvoicing(orderId: number | undefined) {
  return useQuery({
    queryKey: vendorQueryKeys.poItemsForInvoicing(orderId!),
    queryFn: () => vendorApi.getPOItemsForInvoicing(orderId!),
    enabled: !!orderId,
  });
}

export function useSubmitVendorQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfpId,
      data,
    }: {
      rfpId: number;
      data: SubmitQuotationData;
    }) => vendorApi.submitQuotation(rfpId, data),
    onSuccess: response => {
      toast.success(response.message || 'Quotation submitted successfully!');
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.quotations });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.rfps });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.dashboard });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to submit quotation';
      toast.error(message);
    },
  });
}

export function useResubmitVendorQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quotationId,
      data,
    }: {
      quotationId: number;
      data: SubmitQuotationData;
    }) => vendorApi.resubmitQuotation(quotationId, data),
    onSuccess: (response, { quotationId }) => {
      toast.success(response.message || 'Quotation updated successfully!');
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.quotations });
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.quotation(quotationId),
      });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.rfps });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.dashboard });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to update quotation';
      toast.error(message);
    },
  });
}

export function useCreateVendorInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VendorCreateInvoiceRequest) =>
      vendorApi.createInvoice(data),
    onSuccess: () => {
      toast.success('Invoice created successfully!');
      // Invalidate relevant queries (dashboard for counts, orders for status if it changes)
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.orders });
      // We don't have a invoices list query in this file yet, but if we did we'd invalidate it
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to create invoice';
      toast.error(message);
    },
  });
}

export function useVendorContracts() {
  return useQuery({
    queryKey: vendorQueryKeys.contracts,
    queryFn: vendorApi.getMyContracts,
    staleTime: 30 * 1000,
  });
}

export function useAcknowledgeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: number; status: string; remarks?: string }) =>
      vendorApi.acknowledgeContract(id, status, remarks),
    onSuccess: () => {
      toast.success('Contract updated successfully');
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.contracts });
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.dashboard });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update contract');
    }
  });
}
