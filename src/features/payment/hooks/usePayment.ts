import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createPayment,
  checkPaymentEligibility,
  getPaymentsByInvoice,
  getPaymentById,
  getAllPayments,
  approvePayment,
  rejectPayment,
  getPendingPayments,
} from '../api/paymentApi';
import type { CreatePaymentRequest } from '../types';

const PAYMENT_KEYS = {
  all: ['payments'] as const,
  lists: () => [...PAYMENT_KEYS.all, 'list'] as const,
  pending: () => [...PAYMENT_KEYS.all, 'pending'] as const,
  detail: (id: number) => [...PAYMENT_KEYS.all, 'detail', id] as const,
  byInvoice: (invoiceId: number) =>
    [...PAYMENT_KEYS.all, 'invoice', invoiceId] as const,
  eligibility: (invoiceId: number) =>
    [...PAYMENT_KEYS.all, 'eligibility', invoiceId] as const,
};

export const useAllPayments = () => {
  return useQuery({
    queryKey: PAYMENT_KEYS.lists(),
    queryFn: getAllPayments,
  });
};

export const usePendingPayments = () => {
  return useQuery({
    queryKey: PAYMENT_KEYS.pending(),
    queryFn: getPendingPayments,
  });
};

export const usePaymentById = (id: number) => {
  return useQuery({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: () => getPaymentById(id),
    enabled: !!id,
  });
};

export const usePaymentsByInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: PAYMENT_KEYS.byInvoice(invoiceId),
    queryFn: () => getPaymentsByInvoice(invoiceId),
    enabled: !!invoiceId,
  });
};

export const usePaymentEligibility = (invoiceId: number) => {
  return useQuery({
    queryKey: PAYMENT_KEYS.eligibility(invoiceId),
    queryFn: () => checkPaymentEligibility(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePaymentRequest) => createPayment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      toast.success('Payment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment');
    },
  });
};

export const useApprovePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approvePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      toast.success('Payment approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve payment');
    },
  });
};

export const useRejectPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks?: string }) =>
      rejectPayment(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      toast.success('Payment rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject payment');
    },
  });
};
