import axios from 'axios';
import type { Invoice } from '../../purchaseorder/types';
import { InvoiceStatus, InvoiceType } from '../../purchaseorder/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const invoiceApi = {
  // Get all invoices
  getAllInvoices: async (params?: {
    status?: InvoiceStatus;
    type?: InvoiceType;
    supplierId?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/invoice`, { params });
    return response.data;
  },

  // Get invoice by ID
  getInvoiceById: async (id: number) => {
    const response = await axios.get<Invoice>(`${API_BASE_URL}/invoice/${id}`);
    return response.data;
  },

  // Create new invoice
  createInvoice: async (data: Partial<Invoice>) => {
    const response = await axios.post<Invoice>(`${API_BASE_URL}/invoice`, data);
    return response.data;
  },

  // Update invoice
  updateInvoice: async (id: number, data: Partial<Invoice>) => {
    const response = await axios.put<Invoice>(`${API_BASE_URL}/invoice/${id}`, data);
    return response.data;
  },

  // Delete invoice
  deleteInvoice: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/invoice/${id}`);
    return response.data;
  },

  // Submit invoice for approval
  submitInvoice: async (id: number) => {
    const response = await axios.put<Invoice>(`${API_BASE_URL}/invoice/${id}/submit`);
    return response.data;
  },

  // Approve invoice
  approveInvoice: async (id: number, comments?: string) => {
    const response = await axios.put<Invoice>(
      `${API_BASE_URL}/invoice/${id}/approve`,
      { comments }
    );
    return response.data;
  },

  // Reject invoice
  rejectInvoice: async (id: number, reason: string) => {
    const response = await axios.put<Invoice>(
      `${API_BASE_URL}/invoice/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  // Perform three-way matching
  performThreeWayMatch: async (id: number) => {
    const response = await axios.post<{
      matched: boolean;
      matchStatus: string;
      discrepancies?: Array<{
        field: string;
        poValue: any;
        grnValue: any;
        invoiceValue: any;
      }>;
    }>(`${API_BASE_URL}/invoice/${id}/three-way-match`);
    return response.data;
  },

  // Record payment
  recordPayment: async (id: number, data: {
    paymentAmount: number;
    paymentDate: string;
    paymentMode: string;
    paymentReference: string;
    bankName?: string;
    remarks?: string;
  }) => {
    const response = await axios.post<Invoice>(
      `${API_BASE_URL}/invoice/${id}/payment`,
      data
    );
    return response.data;
  },

  // Create invoice from PO
  createInvoiceFromPO: async (poId: number) => {
    const response = await axios.post<Invoice>(
      `${API_BASE_URL}/invoice/from-po/${poId}`
    );
    return response.data;
  },

  // Create invoice from GRN
  createInvoiceFromGRN: async (grnId: number) => {
    const response = await axios.post<Invoice>(
      `${API_BASE_URL}/invoice/from-grn/${grnId}`
    );
    return response.data;
  },

  // Create credit note
  createCreditNote: async (originalInvoiceId: number, data: {
    reason: string;
    items: Array<{
      id: number;
      quantity: number;
      amount: number;
    }>;
  }) => {
    const response = await axios.post<Invoice>(
      `${API_BASE_URL}/invoice/${originalInvoiceId}/credit-note`,
      data
    );
    return response.data;
  },

  // Create debit note
  createDebitNote: async (originalInvoiceId: number, data: {
    reason: string;
    additionalAmount: number;
    description: string;
  }) => {
    const response = await axios.post<Invoice>(
      `${API_BASE_URL}/invoice/${originalInvoiceId}/debit-note`,
      data
    );
    return response.data;
  },

  // Get invoices by PO ID
  getInvoicesByPurchaseOrderId: async (poId: number) => {
    const response = await axios.get<Invoice[]>(`${API_BASE_URL}/invoice/purchase-order/${poId}`);
    return response.data;
  },

  // Get invoices by GRN ID
  getInvoicesByGRNId: async (grnId: number) => {
    const response = await axios.get<Invoice[]>(`${API_BASE_URL}/invoice/grn/${grnId}`);
    return response.data;
  },

  // Get overdue invoices
  getOverdueInvoices: async () => {
    const response = await axios.get<Invoice[]>(`${API_BASE_URL}/invoice/overdue`);
    return response.data;
  },

  // Download invoice as PDF
  downloadInvoice: async (id: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/invoice/${id}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Get invoice statistics
  getInvoiceStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/invoice/statistics`);
    return response.data;
  },

  // Get payment summary
  getPaymentSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/invoice/payment-summary`, { params });
    return response.data;
  },

  // Upload invoice attachment
  uploadInvoiceAttachment: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/invoice/${id}/attachment`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Send invoice reminder
  sendPaymentReminder: async (id: number, data?: {
    recipientEmail?: string;
    message?: string;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/invoice/${id}/reminder`,
      data
    );
    return response.data;
  }
};