import { apiClient } from '@/lib/api';
import type { PurchaseOrder } from '../types';

export const purchaseOrderApi = {
  // Create new purchase order
  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.post('/purchaseorder', data);
    return response.data;
  },

  // Create PO from approved RFP
  createPOFromRFP: async (rfpId: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchaseorder/from-rfp/${rfpId}`, data);
    return response.data;
  },

  // Update purchase order
  updatePurchaseOrder: async (id: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.put(`/purchaseorder/${id}`, data);
    return response.data;
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.get(`/purchaseorder/${id}`);
    return response.data;
  },

  // Get purchase order by PO number
  getPurchaseOrderByNumber: async (poNumber: string): Promise<PurchaseOrder> => {
    const response = await apiClient.get(`/purchaseorder/number/${poNumber}`);
    return response.data;
  },

  // Get all purchase orders
  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get('/purchaseorder');
    return response.data;
  },

  // Get POs by status
  getPurchaseOrdersByStatus: async (status: string): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get(`/purchaseorder/status/${status}`);
    return response.data;
  },

  // Get POs by supplier
  getPurchaseOrdersBySupplierId: async (supplierId: number): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get(`/purchaseorder/supplier/${supplierId}`);
    return response.data;
  },

  // Search purchase orders
  searchPurchaseOrders: async (searchTerm: string): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get('/purchaseorder/search', {
      params: { searchTerm }
    });
    return response.data;
  },

  // Get POs by date range
  getPurchaseOrdersByDateRange: async (startDate: string, endDate: string): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get('/purchaseorder/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get approved RFPs ready for PO creation
  getApprovedRFPsForPOCreation: async (): Promise<any[]> => {
    const response = await apiClient.get('/purchaseorder/approved-rfps');
    return response.data;
  },

  // Submit PO for approval
  submitForApproval: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchaseorder/${id}/submit`);
    return response.data;
  },

  // Approve purchase order
  approvePurchaseOrder: async (id: number, approvedBy: string): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchaseorder/${id}/approve`, null, {
      params: { approvedBy }
    });
    return response.data;
  },

  // Reject purchase order
  rejectPurchaseOrder: async (id: number, reason: string): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchaseorder/${id}/reject`, null, {
      params: { reason }
    });
    return response.data;
  },

  // Cancel purchase order
  cancelPurchaseOrder: async (id: number, reason: string): Promise<PurchaseOrder> => {
    const response = await apiClient.post(`/purchaseorder/${id}/cancel`, null, {
      params: { reason }
    });
    return response.data;
  },

  // Delete purchase order
  deletePurchaseOrder: async (id: number): Promise<void> => {
    await apiClient.delete(`/purchaseorder/${id}`);
  },

  // Generate PO number
  generatePONumber: async (): Promise<string> => {
    const response = await apiClient.get('/purchaseorder/generate-number');
    return response.data;
  },

  // Export PO to PDF
  exportPOToPdf: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/purchaseorder/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
