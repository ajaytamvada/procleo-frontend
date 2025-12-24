/**
 * React Query hooks for OCR operations
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  processOcrImage,
  extractOcrText,
  getOcrStatus,
  validateOcrFile,
} from '../api/ocrApi';
import type { OcrResultDto, OcrStatusDto } from '../api/ocrApi';

// ========== QUERY HOOKS ==========

/**
 * Hook to check OCR service availability
 */
export const useOcrStatus = () => {
  return useQuery<OcrStatusDto>({
    queryKey: ['ocr-status'],
    queryFn: getOcrStatus,
    staleTime: 60000, // Cache for 1 minute
    retry: false, // Don't retry if OCR is not available
  });
};

// ========== MUTATION HOOKS ==========

/**
 * Hook to process an invoice image using OCR
 */
export const useProcessOcrImage = () => {
  return useMutation<OcrResultDto, Error, File>({
    mutationFn: (file: File) => processOcrImage(file),
    onSuccess: data => {
      if (data.success) {
        toast.success(
          `Invoice scanned successfully (${data.processingTimeMs}ms)`
        );
      } else {
        toast.error(data.errorMessage || 'Failed to process image');
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.errorMessage ||
        error.message ||
        'Failed to process image';
      toast.error(message);
    },
  });
};

/**
 * Hook to extract raw text from an image
 */
export const useExtractOcrText = () => {
  return useMutation({
    mutationFn: (file: File) => extractOcrText(file),
    onSuccess: data => {
      if (data.success) {
        toast.success('Text extracted successfully');
      } else {
        toast.error(data.message || 'Failed to extract text');
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to extract text';
      toast.error(message);
    },
  });
};

/**
 * Hook to validate if a file is supported for OCR
 */
export const useValidateOcrFile = () => {
  return useMutation({
    mutationFn: (filename: string) => validateOcrFile(filename),
  });
};
