import { apiClient } from '@/lib/api';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateDirectInvoiceRequest,
  UpdateDirectInvoiceRequest,
  POItemForInvoice,
  PODetailsForInvoice,
  POForInvoicing,
} from '../types';

// ========== INVOICE ENTRY (PO-based) ENDPOINTS ==========

export const createInvoice = async (
  request: CreateInvoiceRequest
): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>('/invoice', request);
  return response.data;
};

export const updateInvoice = async (
  id: number,
  request: UpdateInvoiceRequest
): Promise<Invoice> => {
  const response = await apiClient.put<Invoice>(`/invoice/${id}`, request);
  return response.data;
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  const response = await apiClient.get<Invoice>(`/invoice/${id}`);
  return response.data;
};

export const getInvoiceByNumber = async (
  invoiceNumber: string
): Promise<Invoice> => {
  const response = await apiClient.get<Invoice>(
    `/invoice/number/${invoiceNumber}`
  );
  return response.data;
};

export const getAllInvoices = async (
  paginated?: boolean
): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice', {
    params: { paginated: paginated || false },
  });

  // Defensive programming: ensure we return an array
  return Array.isArray(response.data) ? response.data : [];
};

export const getInvoicesPaginated = async (
  page: number = 0,
  size: number = 10
) => {
  const response = await apiClient.get('/invoice', {
    params: { paginated: true, page, size },
  });
  return response.data;
};

export const getInvoicesByPoId = async (poId: number): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>(`/invoice/po/${poId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getInvoicesBySupplierId = async (
  supplierId: number
): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>(
    `/invoice/supplier/${supplierId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getInvoicesByStatus = async (
  status: string
): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>(`/invoice/status/${status}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getDraftInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice/drafts');
  return Array.isArray(response.data) ? response.data : [];
};

export const getPendingApprovalInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice/pending-approval');
  return Array.isArray(response.data) ? response.data : [];
};

export const getInvoicesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice/date-range', {
    params: { startDate, endDate },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const searchInvoices = async (
  searchTerm: string
): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice/search', {
    params: { searchTerm },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const deleteInvoice = async (
  id: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/invoice/${id}`
  );
  return response.data;
};

// ========== INVOICE WORKFLOW ENDPOINTS ==========

export const submitInvoice = async (id: number): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>(`/invoice/${id}/submit`);
  return response.data;
};

export const approveInvoice = async (id: number): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>(`/invoice/${id}/approve`);
  return response.data;
};

export const rejectInvoice = async (
  id: number,
  remarks: string
): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>(
    `/invoice/${id}/reject`,
    null,
    {
      params: { remarks },
    }
  );
  return response.data;
};

// ========== PO HELPERS FOR INVOICE ENTRY ==========

export const getPOItemsForInvoicing = async (
  poId: number
): Promise<POItemForInvoice[]> => {
  const response = await apiClient.get<POItemForInvoice[]>(
    `/invoice/po/${poId}/items`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getPODetails = async (
  poId: number
): Promise<PODetailsForInvoice> => {
  const response = await apiClient.get<PODetailsForInvoice>(
    `/invoice/po/${poId}/details`
  );
  return response.data;
};

export const getPOsForInvoicing = async (): Promise<POForInvoicing[]> => {
  const response = await apiClient.get<POForInvoicing[]>(
    '/invoice/po/available'
  );
  return Array.isArray(response.data) ? response.data : [];
};

// ========== INVOICE NUMBER UTILITIES ==========

export const checkInvoiceNumber = async (
  invoiceNumber: string
): Promise<boolean> => {
  const response = await apiClient.get<{ exists: boolean }>(
    `/invoice/check-number/${invoiceNumber}`
  );
  return response.data.exists;
};

export const generateInvoiceNumber = async (): Promise<string> => {
  const response = await apiClient.get<{ invoiceNumber: string }>(
    '/invoice/generate-number'
  );
  return response.data.invoiceNumber;
};

// ========== DIRECT INVOICE ENDPOINTS ==========

export const createDirectInvoice = async (
  request: CreateDirectInvoiceRequest
): Promise<Invoice> => {
  const response = await apiClient.post<Invoice>('/invoice/direct', request);
  return response.data;
};

export const updateDirectInvoice = async (
  id: number,
  request: UpdateDirectInvoiceRequest
): Promise<Invoice> => {
  const response = await apiClient.put<Invoice>(
    `/invoice/direct/${id}`,
    request
  );
  return response.data;
};

export const getAllDirectInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice/direct');
  return Array.isArray(response.data) ? response.data : [];
};

export const getDirectDraftInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get<Invoice[]>('/invoice/direct/drafts');
  return Array.isArray(response.data) ? response.data : [];
};

export const deleteDirectInvoiceItem = async (
  itemId: number
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/invoice/direct/item/${itemId}`
  );
  return response.data;
};

// ========== FILE DOWNLOAD ==========

export const downloadInvoiceAttachment = async (id: number): Promise<Blob> => {
  const response = await apiClient.get(`/invoice/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// ========== EXPORT ALL AS OBJECT ==========

export const invoiceApi = {
  // Invoice Entry (PO-based)
  createInvoice,
  updateInvoice,
  getInvoiceById,
  getInvoiceByNumber,
  getAllInvoices,
  getInvoicesPaginated,
  getInvoicesByPoId,
  getInvoicesBySupplierId,
  getInvoicesByStatus,
  getDraftInvoices,
  getPendingApprovalInvoices,
  getInvoicesByDateRange,
  searchInvoices,
  deleteInvoice,

  // Workflow
  submitInvoice,
  approveInvoice,
  rejectInvoice,

  // PO Helpers
  getPOItemsForInvoicing,
  getPODetails,
  getPOsForInvoicing,

  // Utilities
  checkInvoiceNumber,
  generateInvoiceNumber,

  // Direct Invoice
  createDirectInvoice,
  updateDirectInvoice,
  getAllDirectInvoices,
  getDirectDraftInvoices,
  deleteDirectInvoiceItem,

  // File Download
  downloadInvoiceAttachment,
};
