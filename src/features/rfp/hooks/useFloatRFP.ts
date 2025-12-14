/**
 * React Query hooks for Float RFP operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rfpApi } from '../services/rfpApi';
import { vendorApi } from '@/services/vendorApi';

/**
 * Hook to get RFP by ID
 */
export const useRFPById = (id: number) => {
  return useQuery({
    queryKey: ['rfp', id],
    queryFn: () => rfpApi.getRFPById(id),
    enabled: !!id,
  });
};

/**
 * Hook to get all vendors
 */
export const useAllVendors = () => {
  return useQuery({
    queryKey: ['vendors', 'all'],
    queryFn: () => vendorApi.getAllVendors(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to float RFP to suppliers
 */
export const useFloatRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfpId,
      supplierIds,
      unregisteredVendors,
    }: {
      rfpId: number;
      supplierIds?: number[];
      unregisteredVendors?: { email: string; name?: string; contactPerson?: string }[];
    }) => rfpApi.floatRFP(rfpId, { supplierIds, unregisteredVendors }),
    onSuccess: data => {
      toast.success(
        `RFP ${data.rfpNumber} floated successfully to ${data.totalSuppliers || 0} suppliers!`
      );
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to float RFP';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to add suppliers to RFP
 */
export const useAddSuppliers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfpId,
      supplierIds,
    }: {
      rfpId: number;
      supplierIds: number[];
    }) => rfpApi.addSuppliersToRFP(rfpId, supplierIds),
    onSuccess: data => {
      toast.success(`Added suppliers to RFP ${data.rfpNumber}`);
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to add suppliers';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to remove suppliers from RFP
 */
export const useRemoveSuppliers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rfpId,
      supplierIds,
    }: {
      rfpId: number;
      supplierIds: number[];
    }) => rfpApi.removeSuppliersFromRFP(rfpId, supplierIds),
    onSuccess: data => {
      toast.success(`Removed suppliers from RFP ${data.rfpNumber}`);
      queryClient.invalidateQueries({ queryKey: ['rfp', data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to remove suppliers';
      toast.error(errorMessage);
    },
  });
};
