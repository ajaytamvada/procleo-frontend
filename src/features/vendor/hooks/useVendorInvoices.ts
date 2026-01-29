import { apiClient } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorQueryKeys } from './useVendorPortal';
import { Invoice } from '../../purchaseorder/types';

// --- Types ---

export interface VendorInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  poNumber: string;
  poId: number;
  totalAmount: number;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'REJECTED'
    | 'PAID'
    | 'PARTIALLY_PAID';
  paymentDate?: string;
  remarks?: string;
  createdAt: string;
}

// --- API Functions ---

const vendorInvoiceApi = {
  getMyInvoices: async (): Promise<VendorInvoice[]> => {
    const response = await apiClient.get('/vendor-portal/invoices');
    return response.data;
  },

  getInvoiceDetails: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get(`/vendor-portal/invoices/${id}`);
    return response.data;
  },

  downloadInvoice: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(
      `/vendor-portal/invoices/${id}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

// --- Hooks ---

export function useVendorInvoices() {
  return useQuery({
    queryKey: ['vendor', 'invoices'],
    queryFn: vendorInvoiceApi.getMyInvoices,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useVendorInvoiceDetails(id: number | undefined) {
  return useQuery({
    queryKey: ['vendor', 'invoices', id],
    queryFn: () => vendorInvoiceApi.getInvoiceDetails(id!),
    enabled: !!id,
  });
}

export const downloadVendorInvoice = async (
  id: number,
  invoiceNumber: string
) => {
  try {
    const blob = await vendorInvoiceApi.downloadInvoice(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invoiceNumber}.pdf`); // Assuming PDF
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download invoice', error);
    throw error;
  }
};
