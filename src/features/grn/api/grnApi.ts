import axios from 'axios';
import type { GRN } from '../../purchaseorder/types';
import { GRNStatus } from '../../purchaseorder/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const grnApi = {
  // Get all GRNs
  getAllGRNs: async (params?: {
    status?: GRNStatus;
    supplierId?: number;
    poId?: number;
    search?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/grn`, { params });
    return response.data;
  },

  // Get GRN by ID
  getGRNById: async (id: number) => {
    const response = await axios.get<GRN>(`${API_BASE_URL}/grn/${id}`);
    return response.data;
  },

  // Create new GRN
  createGRN: async (data: Partial<GRN>) => {
    const response = await axios.post<GRN>(`${API_BASE_URL}/grn`, data);
    return response.data;
  },

  // Update GRN
  updateGRN: async (id: number, data: Partial<GRN>) => {
    const response = await axios.put<GRN>(`${API_BASE_URL}/grn/${id}`, data);
    return response.data;
  },

  // Delete GRN
  deleteGRN: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/grn/${id}`);
    return response.data;
  },

  // Approve GRN
  approveGRN: async (id: number, comments?: string) => {
    const response = await axios.put<GRN>(
      `${API_BASE_URL}/grn/${id}/approve`,
      { comments }
    );
    return response.data;
  },

  // Reject GRN
  rejectGRN: async (id: number, reason: string) => {
    const response = await axios.put<GRN>(
      `${API_BASE_URL}/grn/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  // Update quality check status
  updateQualityCheck: async (id: number, data: {
    status: string;
    remarks?: string;
    items?: Array<{
      id: number;
      qualityStatus: string;
      qualityRemarks?: string;
    }>;
  }) => {
    const response = await axios.put<GRN>(
      `${API_BASE_URL}/grn/${id}/quality-check`,
      data
    );
    return response.data;
  },

  // Get GRNs by PO ID
  getGRNsByPurchaseOrderId: async (poId: number) => {
    const response = await axios.get<GRN[]>(`${API_BASE_URL}/grn/purchase-order/${poId}`);
    return response.data;
  },

  // Get pending GRNs for invoice creation
  getPendingGRNsForInvoice: async (supplierId?: number) => {
    const response = await axios.get<GRN[]>(`${API_BASE_URL}/grn/pending-invoice`, {
      params: { supplierId }
    });
    return response.data;
  },

  // Create partial GRN
  createPartialGRN: async (poId: number, data: Partial<GRN>) => {
    const response = await axios.post<GRN>(
      `${API_BASE_URL}/grn/partial/${poId}`,
      data
    );
    return response.data;
  },

  // Download GRN as PDF
  downloadGRN: async (id: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/grn/${id}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Get GRN statistics
  getGRNStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/grn/statistics`);
    return response.data;
  },

  // Get quality check summary
  getQualityCheckSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/grn/quality-summary`, { params });
    return response.data;
  },

  // Return goods
  createReturnGRN: async (originalGrnId: number, data: {
    returnReason: string;
    items: Array<{
      id: number;
      returnQuantity: number;
      reason: string;
    }>;
  }) => {
    const response = await axios.post<GRN>(
      `${API_BASE_URL}/grn/${originalGrnId}/return`,
      data
    );
    return response.data;
  }
};