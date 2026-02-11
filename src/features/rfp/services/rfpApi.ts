import { apiClient } from '@/lib/api';
import type {
  RFP,
  RFPFormData,
  RFPFilterParams,
  RFPQuotation,
  RFPSupplier,
  RFPSummary,
} from '../types';

export const rfpApi = {
  // Create a new RFP
  createRFP: async (data: RFPFormData): Promise<RFP> => {
    const response = await apiClient.post('/rfp', data);
    return response.data;
  },

  // Update an existing RFP
  updateRFP: async (id: number, data: RFPFormData): Promise<RFP> => {
    const response = await apiClient.put(`/rfp/${id}`, data);
    return response.data;
  },

  // Get RFP by ID
  getRFPById: async (id: number): Promise<RFP> => {
    const response = await apiClient.get(`/rfp/${id}`);
    return response.data;
  },

  // Get RFP by number
  getRFPByNumber: async (rfpNumber: string): Promise<RFP> => {
    const response = await apiClient.get(`/rfp/number/${rfpNumber}`);
    return response.data;
  },

  // Get all RFPs with pagination and filtering
  getAllRFPs: async (
    params?: RFPFilterParams
  ): Promise<{
    content: RFP[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> => {
    const response = await apiClient.get('/rfp', { params });
    return response.data;
  },

  // Get RFPs by status
  getRFPsByStatus: async (status: string): Promise<RFP[]> => {
    const response = await apiClient.get(`/rfp/status/${status}`);
    return response.data;
  },

  // Get RFPs by department
  getRFPsByDepartment: async (department: string): Promise<RFP[]> => {
    const response = await apiClient.get(`/rfp/department/${department}`);
    return response.data;
  },

  // Search RFPs
  searchRFPs: async (searchTerm: string): Promise<RFP[]> => {
    const response = await apiClient.get('/rfp/search', {
      params: { searchTerm },
    });
    return response.data;
  },

  // Float RFP to suppliers (registered and unregistered)
  floatRFP: async (
    id: number,
    request: {
      supplierIds?: number[];
      unregisteredVendors?: {
        email: string;
        name?: string;
        contactPerson?: string;
      }[];
    }
  ): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${id}/float`, request);
    return response.data;
  },

  // Add suppliers to RFP
  addSuppliersToRFP: async (
    id: number,
    supplierIds: number[]
  ): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${id}/suppliers`, supplierIds);
    return response.data;
  },

  // Remove suppliers from RFP
  removeSuppliersFromRFP: async (
    id: number,
    supplierIds: number[]
  ): Promise<RFP> => {
    const response = await apiClient.delete(`/rfp/${id}/suppliers`, {
      data: supplierIds,
    });
    return response.data;
  },

  // Get RFP suppliers
  getRFPSuppliers: async (rfpId: number): Promise<RFPSupplier[]> => {
    const response = await apiClient.get(`/rfp/${rfpId}/suppliers`);
    return response.data;
  },

  // Submit quotation
  submitQuotation: async (
    rfpId: number,
    quotation: RFPQuotation
  ): Promise<RFP> => {
    const response = await apiClient.post(
      `/rfp/${rfpId}/quotations`,
      quotation
    );
    return response.data;
  },

  // Update quotation (re-submit)
  updateQuotation: async (
    rfpId: number,
    quotationId: number,
    quotation: RFPQuotation
  ): Promise<RFP> => {
    const response = await apiClient.put(
      `/rfp/${rfpId}/quotations/${quotationId}`,
      quotation
    );
    return response.data;
  },

  // Get RFP quotations
  getRFPQuotations: async (rfpId: number): Promise<RFPQuotation[]> => {
    const response = await apiClient.get(`/rfp/${rfpId}/quotations`);
    return response.data;
  },

  // Get quotation details by quotation ID
  getQuotationDetails: async (quotationId: number): Promise<RFPQuotation> => {
    const response = await apiClient.get(`/rfp/quotations/${quotationId}`);
    return response.data;
  },

  // Negotiate quotation (mark for re-submission)
  negotiateQuotation: async (
    quotationId: number,
    negotiationNotes?: string
  ): Promise<RFP> => {
    const response = await apiClient.post(
      `/rfp/quotations/${quotationId}/negotiate`,
      null,
      {
        params: { negotiationNotes },
      }
    );
    return response.data;
  },

  // Send RFP for approval
  sendForApproval: async (request: {
    rfpId: number;
    remarks?: string;
  }): Promise<RFP> => {
    const response = await apiClient.post('/rfp/send-for-approval', request);
    return response.data;
  },

  // Get RFPs waiting for approval
  getRFPsWaitingForApproval: async (): Promise<RFP[]> => {
    const response = await apiClient.get('/rfp/waiting-for-approval');
    return response.data;
  },

  // Approve or reject RFP
  approveOrRejectRFP: async (request: {
    rfpId: number;
    action: string;
    remarks?: string;
  }): Promise<RFP> => {
    const response = await apiClient.post('/rfp/approve-reject', request);
    return response.data;
  },

  // Get RFP Summary
  getRFPSummary: async (rfpId: number): Promise<RFPSummary> => {
    const response = await apiClient.get(`/rfp/${rfpId}/summary`);
    return response.data;
  },

  // Evaluate quotations
  evaluateQuotations: async (rfpId: number): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${rfpId}/evaluate`);
    return response.data;
  },

  // Select supplier
  selectSupplier: async (rfpId: number, supplierId: number): Promise<RFP> => {
    const response = await apiClient.post(
      `/rfp/${rfpId}/select-supplier/${supplierId}`
    );
    return response.data;
  },

  // Approve RFP
  approveRFP: async (id: number): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${id}/approve`);
    return response.data;
  },

  // Reject RFP
  rejectRFP: async (id: number, reason: string): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${id}/reject`, null, {
      params: { reason },
    });
    return response.data;
  },

  // Cancel RFP
  cancelRFP: async (id: number, reason: string): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${id}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  },

  // Extend RFP
  extendRFP: async (
    id: number,
    newClosingDate: string,
    reason?: string
  ): Promise<RFP> => {
    const response = await apiClient.post(`/rfp/${id}/extend`, {
      newClosingDate,
      reason,
    });
    return response.data;
  },

  // Delete RFP
  deleteRFP: async (id: number): Promise<void> => {
    await apiClient.delete(`/rfp/${id}`);
  },

  // Generate RFP number
  generateRFPNumber: async (): Promise<string> => {
    const response = await apiClient.get('/rfp/generate-number');
    return response.data.rfpNumber;
  },

  // Export RFP to PDF
  exportRFPToPdf: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/rfp/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export quotation comparison
  exportQuotationComparison: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/rfp/${id}/export/comparison`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get AI Insights for RFP
  getRfpInsights: async (rfpId: number): Promise<RfpInsight[]> => {
    // OLD: const response = await apiClient.get(`/rfp/${rfpId}/insights`);
    // NEW: Generate insights dynamically using the LLM via /api/ocr/generate

    // 1. Fetch RFP details and quotations to build context
    const rfp = await rfpApi.getRFPById(rfpId);
    const quotations = await rfpApi.getRFPQuotations(rfpId);

    if (!quotations || quotations.length === 0) {
      return [];
    }

    // 2. Construct Prompt
    const prompt = `
      Analyze these vendor quotations for RFP #${rfp.rfpNumber} ${rfp.remarks ? `(Description/Remarks: ${rfp.remarks})` : ''}.
      
      Quotations:
      ${quotations.map(q => `- Vendor: ${q.supplierName}, Total: ${q.totalAmount}, Net: ${q.netAmount}, Date: ${q.quotationDate}`).join('\n')}
      
      Task:
      Generate 3 distinct insights to help select the best vendor.
      1. Cost Analysis (Identify the lowest bidder and savings).
      2. Delivery/Speed (Based on dates if available, else general efficiency).
      3. Compliance/Overall Value.
      
      Output strictly valid JSON in this format:
      [
        {
          "title": "Insight Title",
          "recommendation": "Recommendation text",
          "explanation": "Detailed explanation",
          "variant": "cost" | "delivery" | "compliance",
          "metrics": [{"label": "Metric Name", "value": "Metric Value"}]
        }
      ]
    `;

    // 3. Call LLM
    try {
      console.log('[AI Insights] Calling /ocr/generate with prompt length:', prompt.length);
      // Increased timeout to 120s (2 minutes) to allow LLM generation
      const response = await apiClient.post('/ocr/generate', { prompt }, { timeout: 120000 });
      console.log('[AI Insights] received response:', response.data);

      if (response.data && response.data.success && response.data.text) {
        let jsonStr = response.data.text.trim();
        // Clean markdown
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

        const parsed = JSON.parse(jsonStr);
        console.log('[AI Insights] Parsed JSON:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error("Failed to generate insights", e);
    }

    // Fallback if AI fails or returns invalid JSON
    return [];
  },
};

export interface RfpInsight {
  title: string;
  recommendation: string;
  explanation: string;
  variant: 'cost' | 'delivery' | 'compliance';
  metrics?: { label: string; value: string }[];
}
