import { useQuery } from '@tanstack/react-query';
import {
  getPRReport,
  getInvoiceReport,
  getThreeWayMatchReport,
  getVendorReport,
  getPOReport,
  getGRNReport,
  getFloatRFPReport,
  getSubmittedRFPReport,
} from '../api/reportApi';

/**
 * Hook to fetch Purchase Requisition Report
 */
export const usePRReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'pr', startDate, endDate],
    queryFn: () => getPRReport(startDate, endDate),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch Invoice Report
 */
export const useInvoiceReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'invoices', startDate, endDate],
    queryFn: () => getInvoiceReport(startDate, endDate),
    staleTime: 300000,
  });
};

/**
 * Hook to fetch Three Way Match Report
 */
export const useThreeWayMatchReport = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['reports', 'three-way-match', startDate, endDate],
    queryFn: () => getThreeWayMatchReport(startDate, endDate),
    staleTime: 300000,
  });
};

/**
 * Hook to fetch Vendor Report
 */
export const useVendorReport = (legalForm: string = 'all') => {
  return useQuery({
    queryKey: ['reports', 'vendor', legalForm],
    queryFn: () => getVendorReport(legalForm),
    staleTime: 300000,
  });
};

/**
 * Hook to fetch Purchase Order Report
 */
export const usePOReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'po', startDate, endDate],
    queryFn: () => getPOReport(startDate, endDate),
    staleTime: 300000,
  });
};

/**
 * Hook to fetch GRN Report
 */
export const useGRNReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'grn', startDate, endDate],
    queryFn: () => getGRNReport(startDate, endDate),
    staleTime: 300000,
  });
};

/**
 * Hook to fetch Float/Open RFP Report
 */
export const useFloatRFPReport = () => {
  return useQuery({
    queryKey: ['reports', 'rfp-float'],
    queryFn: () => getFloatRFPReport(),
    staleTime: 300000,
  });
};

/**
 * Hook to fetch Submitted RFP Report
 */
export const useSubmittedRFPReport = () => {
  return useQuery({
    queryKey: ['reports', 'rfp-submitted'],
    queryFn: () => getSubmittedRFPReport(),
    staleTime: 300000,
  });
};
