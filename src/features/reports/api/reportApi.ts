import { apiClient } from '@/lib/api';
import type {
  PRReport,
  InvoiceReport,
  ThreeWayMatchReport,
  VendorReport,
  POReport,
  GRNReport,
  FloatRFPReport,
  SubmittedRFPReport,
} from '../types';

/**
 * Get Purchase Requisition Report
 */
export const getPRReport = async (
  startDate?: string,
  endDate?: string
): Promise<PRReport[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<PRReport[]>(
    `/reports/pr?${params.toString()}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get Invoice Report
 */
export const getInvoiceReport = async (
  startDate?: string,
  endDate?: string
): Promise<InvoiceReport[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<InvoiceReport[]>(
    `/reports/invoices?${params.toString()}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get Three Way Match Report
 */
export const getThreeWayMatchReport = async (
  startDate?: string,
  endDate?: string
): Promise<ThreeWayMatchReport[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<ThreeWayMatchReport[]>(
    `/reports/three-way-match?${params.toString()}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get Vendor Report
 */
export const getVendorReport = async (
  legalForm: string = 'all'
): Promise<VendorReport[]> => {
  const response = await apiClient.get<VendorReport[]>(
    `/reports/vendor?legalForm=${legalForm}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get Purchase Order Report
 */
export const getPOReport = async (
  startDate?: string,
  endDate?: string
): Promise<POReport[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<POReport[]>(
    `/reports/po?${params.toString()}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get GRN Report
 */
export const getGRNReport = async (
  startDate?: string,
  endDate?: string
): Promise<GRNReport[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<GRNReport[]>(
    `/reports/grn?${params.toString()}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get Float/Open RFP Report
 */
export const getFloatRFPReport = async (): Promise<FloatRFPReport[]> => {
  const response = await apiClient.get<FloatRFPReport[]>('/reports/rfp-float');
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get Submitted RFP Report
 */
export const getSubmittedRFPReport = async (): Promise<
  SubmittedRFPReport[]
> => {
  const response = await apiClient.get<SubmittedRFPReport[]>(
    '/reports/rfp-submitted'
  );
  return Array.isArray(response.data) ? response.data : [];
};
