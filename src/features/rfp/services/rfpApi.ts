import axios from 'axios';
import type { RFP, RFPFormData, RFPFilterParams, RFPQuotation, RFPSupplier } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/rfp`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const rfpApi = {
  // Create a new RFP
  createRFP: async (data: RFPFormData): Promise<RFP> => {
    const response = await apiClient.post('/', data);
    return response.data;
  },

  // Update an existing RFP
  updateRFP: async (id: number, data: RFPFormData): Promise<RFP> => {
    const response = await apiClient.put(`/${id}`, data);
    return response.data;
  },

  // Get RFP by ID
  getRFPById: async (id: number): Promise<RFP> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Get RFP by number
  getRFPByNumber: async (rfpNumber: string): Promise<RFP> => {
    const response = await apiClient.get(`/number/${rfpNumber}`);
    return response.data;
  },

  // Get all RFPs with pagination and filtering
  getAllRFPs: async (params?: RFPFilterParams): Promise<{
    content: RFP[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> => {
    const response = await apiClient.get('/', { params });
    return response.data;
  },

  // Get RFPs by status
  getRFPsByStatus: async (status: string): Promise<RFP[]> => {
    const response = await apiClient.get(`/status/${status}`);
    return response.data;
  },

  // Get RFPs by department
  getRFPsByDepartment: async (department: string): Promise<RFP[]> => {
    const response = await apiClient.get(`/department/${department}`);
    return response.data;
  },

  // Search RFPs
  searchRFPs: async (searchTerm: string): Promise<RFP[]> => {
    const response = await apiClient.get('/search', { params: { searchTerm } });
    return response.data;
  },

  // Float RFP to suppliers
  floatRFP: async (id: number, supplierIds: number[]): Promise<RFP> => {
    const response = await apiClient.post(`/${id}/float`, supplierIds);
    return response.data;
  },

  // Add suppliers to RFP
  addSuppliersToRFP: async (id: number, supplierIds: number[]): Promise<RFP> => {
    const response = await apiClient.post(`/${id}/suppliers`, supplierIds);
    return response.data;
  },

  // Remove suppliers from RFP
  removeSuppliersFromRFP: async (id: number, supplierIds: number[]): Promise<RFP> => {
    const response = await apiClient.delete(`/${id}/suppliers`, { data: supplierIds });
    return response.data;
  },

  // Get RFP suppliers
  getRFPSuppliers: async (rfpId: number): Promise<RFPSupplier[]> => {
    const response = await apiClient.get(`/${rfpId}/suppliers`);
    return response.data;
  },

  // Submit quotation
  submitQuotation: async (rfpId: number, quotation: RFPQuotation): Promise<RFP> => {
    const response = await apiClient.post(`/${rfpId}/quotations`, quotation);
    return response.data;
  },

  // Update quotation (re-submit)
  updateQuotation: async (rfpId: number, quotationId: number, quotation: RFPQuotation): Promise<RFP> => {
    const response = await apiClient.put(`/${rfpId}/quotations/${quotationId}`, quotation);
    return response.data;
  },

  // Get RFP quotations
  getRFPQuotations: async (rfpId: number): Promise<RFPQuotation[]> => {
    const response = await apiClient.get(`/${rfpId}/quotations`);
    return response.data;
  },

  // Get quotation details by quotation ID
  getQuotationDetails: async (quotationId: number): Promise<RFPQuotation> => {
    const response = await apiClient.get(`/quotations/${quotationId}`);
    return response.data;
  },

  // Negotiate quotation (mark for re-submission)
  negotiateQuotation: async (quotationId: number, negotiationNotes?: string): Promise<RFP> => {
    const response = await apiClient.post(`/quotations/${quotationId}/negotiate`, null, {
      params: { negotiationNotes }
    });
    return response.data;
  },

  // Send RFP for approval
  sendForApproval: async (request: any): Promise<RFP> => {
    const response = await apiClient.post('/send-for-approval', request);
    return response.data;
  },

  // Get RFPs waiting for approval
  getRFPsWaitingForApproval: async (): Promise<RFP[]> => {
    const response = await apiClient.get('/waiting-for-approval');
    return response.data;
  },

  // Approve or reject RFP
  approveOrRejectRFP: async (request: { rfpId: number; action: string; remarks?: string }): Promise<RFP> => {
    const response = await apiClient.post('/approve-reject', request);
    return response.data;
  },

  // Get RFP Summary
  getRFPSummary: async (rfpId: number): Promise<any> => {
    const response = await apiClient.get(`/${rfpId}/summary`);
    return response.data;
  },

  // Evaluate quotations
  evaluateQuotations: async (rfpId: number): Promise<RFP> => {
    const response = await apiClient.post(`/${rfpId}/evaluate`);
    return response.data;
  },

  // Select supplier
  selectSupplier: async (rfpId: number, supplierId: number): Promise<RFP> => {
    const response = await apiClient.post(`/${rfpId}/select-supplier/${supplierId}`);
    return response.data;
  },

  // Approve RFP
  approveRFP: async (id: number): Promise<RFP> => {
    const response = await apiClient.post(`/${id}/approve`);
    return response.data;
  },

  // Reject RFP
  rejectRFP: async (id: number, reason: string): Promise<RFP> => {
    const response = await apiClient.post(`/${id}/reject`, null, { params: { reason } });
    return response.data;
  },

  // Cancel RFP
  cancelRFP: async (id: number, reason: string): Promise<RFP> => {
    const response = await apiClient.post(`/${id}/cancel`, null, { params: { reason } });
    return response.data;
  },

  // Delete RFP
  deleteRFP: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },

  // Generate RFP number
  generateRFPNumber: async (): Promise<string> => {
    const response = await apiClient.get('/generate-number');
    return response.data.rfpNumber;
  },

  // Export RFP to PDF
  exportRFPToPdf: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export quotation comparison
  exportQuotationComparison: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/${id}/export/comparison`, {
      responseType: 'blob',
    });
    return response.data;
  },
};