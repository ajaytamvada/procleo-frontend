import { apiClient } from '@/lib/api';

// ========== OCR TYPES ==========

export interface ExtractedLineItem {
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount?: number;
  hsnCode?: string;
}

export interface ExtractedInvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierName?: string;
  supplierAddress?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  subtotal?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalTaxAmount?: number;
  grandTotal?: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  currency?: string;
  paymentTerms?: string;
  dueDate?: string;
  lineItems?: ExtractedLineItem[];
  invoiceNumberConfidence?: number;
  invoiceDateConfidence?: number;
  totalAmountConfidence?: number;
}

export interface OcrResultDto {
  rawText?: string;
  confidence: number;
  extractedData?: ExtractedInvoiceData;
  processingTimeMs: number;
  filename?: string;
  success: boolean;
  errorMessage?: string;
}

export interface OcrStatusDto {
  available: boolean;
  message: string;
  supportedFormats: string[];
}

// ========== OCR API FUNCTIONS ==========

/**
 * Process an invoice image and extract data using OCR
 */
export const processOcrImage = async (file: File): Promise<OcrResultDto> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<OcrResultDto>(
    '/ocr/process',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Extract raw text from an image
 */
export const extractOcrText = async (
  file: File
): Promise<{
  success: boolean;
  text?: string;
  filename?: string;
  message?: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/ocr/extract-text', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Check if OCR service is available
 */
export const getOcrStatus = async (): Promise<OcrStatusDto> => {
  const response = await apiClient.get<OcrStatusDto>('/ocr/status');
  return response.data;
};

/**
 * Validate if a file type is supported for OCR
 */
export const validateOcrFile = async (
  filename: string
): Promise<{ supported: boolean; filename: string; message?: string }> => {
  const response = await apiClient.post('/ocr/validate', null, {
    params: { filename },
  });
  return response.data;
};

// ========== EXPORT ALL AS OBJECT ==========

export const ocrApi = {
  processOcrImage,
  extractOcrText,
  getOcrStatus,
  validateOcrFile,
};
