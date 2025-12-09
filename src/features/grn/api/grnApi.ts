import { apiClient } from '@/lib/api';
import type {
  GRN,
  CreateGRNRequest,
  UpdateGRNRequest,
  ApproveGRNRequest,
  InvoiceForGRN,
  POForGRN,
} from '../types';

// ========== GRN CRUD ENDPOINTS ==========

export const createGRN = async (request: CreateGRNRequest): Promise<GRN> => {
  const response = await apiClient.post<GRN>('/grn', request);
  return response.data;
};

export const updateGRN = async (
  id: number,
  request: UpdateGRNRequest
): Promise<GRN> => {
  const response = await apiClient.put<GRN>(`/grn/${id}`, request);
  return response.data;
};

export const getGRNById = async (id: number): Promise<GRN> => {
  const response = await apiClient.get<GRN>(`/grn/${id}`);
  return response.data;
};

export const getGRNByNumber = async (grnNumber: string): Promise<GRN> => {
  const response = await apiClient.get<GRN>(`/grn/number/${grnNumber}`);
  return response.data;
};

export const getAllGRNs = async (paginated?: boolean): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn', {
    params: { paginated: paginated || false },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsPaginated = async (page: number = 0, size: number = 10) => {
  const response = await apiClient.get('/grn', {
    params: { paginated: true, page, size },
  });
  return response.data;
};

export const getGRNsByPoId = async (poId: number): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>(`/grn/po/${poId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsByPoNumber = async (poNumber: string): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>(`/grn/po/number/${poNumber}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsBySupplierId = async (
  supplierId: number
): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>(`/grn/supplier/${supplierId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsByStatus = async (status: string): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>(`/grn/status/${status}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getDraftGRNs = async (): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/drafts');
  return Array.isArray(response.data) ? response.data : [];
};

export const getPendingApprovalGRNs = async (): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/pending-approval');
  return Array.isArray(response.data) ? response.data : [];
};

export const getApprovedGRNs = async (): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/approved');
  return Array.isArray(response.data) ? response.data : [];
};

export const getRejectedGRNs = async (): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/rejected');
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/date-range', {
    params: { startDate, endDate },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const searchGRNs = async (searchTerm: string): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/search', {
    params: { searchTerm },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const deleteGRN = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/grn/${id}`);
  return response.data;
};

// ========== GRN WORKFLOW ENDPOINTS ==========

export const submitGRN = async (id: number): Promise<GRN> => {
  const response = await apiClient.post<GRN>(`/grn/${id}/submit`);
  return response.data;
};

export const approveGRN = async (
  id: number,
  request: ApproveGRNRequest
): Promise<GRN> => {
  const response = await apiClient.post<GRN>(`/grn/${id}/approve`, request);
  return response.data;
};

export const rejectGRN = async (
  id: number,
  request: ApproveGRNRequest
): Promise<GRN> => {
  const response = await apiClient.post<GRN>(`/grn/${id}/reject`, request);
  return response.data;
};

// ========== INVOICE HELPERS FOR GRN ==========

export const getInvoicesForGRN = async (): Promise<InvoiceForGRN[]> => {
  const response = await apiClient.get<InvoiceForGRN[]>(
    '/grn/invoices/available'
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getInvoiceDetailsForGRN = async (
  invoiceId: number
): Promise<InvoiceForGRN> => {
  const response = await apiClient.get<InvoiceForGRN>(
    `/grn/invoice/${invoiceId}/details`
  );
  return response.data;
};

export const getPODetailsForGRN = async (poId: number): Promise<POForGRN> => {
  const response = await apiClient.get<POForGRN>(`/grn/po/${poId}/details`);
  return response.data;
};

// ========== GRN NUMBER UTILITIES ==========

export const checkGRNNumber = async (grnNumber: string): Promise<boolean> => {
  const response = await apiClient.get<{ exists: boolean }>(
    `/grn/check-number/${grnNumber}`
  );
  return response.data.exists;
};

export const generateGRNNumber = async (): Promise<string> => {
  const response = await apiClient.get<{ grnNumber: string }>(
    '/grn/generate-number'
  );
  return response.data.grnNumber;
};

// ========== ADDITIONAL GRN ENDPOINTS ==========

export const getGRNsWithoutInvoice = async (): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>('/grn/without-invoice');
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsByInvoiceNumber = async (
  invoiceNumber: string
): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>(
    `/grn/invoice/number/${invoiceNumber}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getGRNsByQualityCheckStatus = async (
  status: string
): Promise<GRN[]> => {
  const response = await apiClient.get<GRN[]>(`/grn/quality-check/${status}`);
  return Array.isArray(response.data) ? response.data : [];
};

// ========== EXPORT ALL AS OBJECT ==========

export const grnApi = {
  // CRUD
  createGRN,
  updateGRN,
  getGRNById,
  getGRNByNumber,
  getAllGRNs,
  getGRNsPaginated,
  getGRNsByPoId,
  getGRNsByPoNumber,
  getGRNsBySupplierId,
  getGRNsByStatus,
  getDraftGRNs,
  getPendingApprovalGRNs,
  getApprovedGRNs,
  getRejectedGRNs,
  getGRNsByDateRange,
  searchGRNs,
  deleteGRN,

  // Workflow
  submitGRN,
  approveGRN,
  rejectGRN,

  // Invoice Helpers
  getInvoicesForGRN,
  getInvoiceDetailsForGRN,
  getPODetailsForGRN,

  // Utilities
  checkGRNNumber,
  generateGRNNumber,

  // Additional
  getGRNsWithoutInvoice,
  getGRNsByInvoiceNumber,
  getGRNsByQualityCheckStatus,
};
