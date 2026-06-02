import { apiClient } from '@/lib/api';
import type {
  Payment,
  CreatePaymentRequest,
  PaymentEligibility,
} from '../types';

export const createPayment = async (
  request: CreatePaymentRequest
): Promise<Payment> => {
  const response = await apiClient.post<Payment>('/payment', request);
  return response.data;
};

export const checkPaymentEligibility = async (
  invoiceId: number
): Promise<PaymentEligibility> => {
  const response = await apiClient.get<PaymentEligibility>(
    `/payment/eligibility/${invoiceId}`
  );
  return response.data;
};

export const getPaymentsByInvoice = async (
  invoiceId: number
): Promise<Payment[]> => {
  const response = await apiClient.get<Payment[]>(
    `/payment/invoice/${invoiceId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getPaymentById = async (id: number): Promise<Payment> => {
  const response = await apiClient.get<Payment>(`/payment/${id}`);
  return response.data;
};

export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await apiClient.get<Payment[]>('/payment');
  return Array.isArray(response.data) ? response.data : [];
};

export const approvePayment = async (id: number): Promise<Payment> => {
  const response = await apiClient.post<Payment>(`/payment/${id}/approve`);
  return response.data;
};

export const rejectPayment = async (
  id: number,
  remarks?: string
): Promise<Payment> => {
  const response = await apiClient.post<Payment>(
    `/payment/${id}/reject`,
    null,
    { params: { remarks } }
  );
  return response.data;
};

export const getPendingPayments = async (): Promise<Payment[]> => {
  const response = await apiClient.get<Payment[]>('/payment/pending');
  return Array.isArray(response.data) ? response.data : [];
};

export const generatePaymentNumber = async (): Promise<string> => {
  const response = await apiClient.get<{ paymentNumber: string }>(
    '/payment/generate-number'
  );
  return response.data.paymentNumber;
};

export const paymentApi = {
  createPayment,
  checkPaymentEligibility,
  getPaymentsByInvoice,
  getPaymentById,
  getAllPayments,
  approvePayment,
  rejectPayment,
  getPendingPayments,
  generatePaymentNumber,
};
