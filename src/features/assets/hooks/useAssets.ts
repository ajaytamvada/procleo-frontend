import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as api from '../api/assetsApi';
import type {
  InstallAssetRequest,
  CreateTransferRequest,
  CreateMaintenanceRequest,
  DisposeAssetRequest,
  UpdateAssetRequest,
} from '../types';

// ======================== ASSET QUERIES ========================

export const useAssets = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['assets', page, size],
    queryFn: () => api.getAssets(page, size),
    staleTime: 30000,
  });
};

export const useAssetById = (id: number | null) => {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => api.getAssetById(id!),
    enabled: id !== null && id > 0,
    staleTime: 30000,
  });
};

export const useAssetsByStatus = (status: string, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'status', status],
    queryFn: () => api.getAssetsByStatus(status),
    enabled,
    staleTime: 30000,
  });
};

export const useAssetsByDepartment = (deptId: number, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'department', deptId],
    queryFn: () => api.getAssetsByDepartment(deptId),
    enabled: enabled && deptId > 0,
  });
};

export const useAssetsByGrn = (grnId: number, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'grn', grnId],
    queryFn: () => api.getAssetsByGrn(grnId),
    enabled: enabled && grnId > 0,
  });
};

export const useSearchAssets = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'search', query],
    queryFn: () => api.searchAssets(query),
    enabled: enabled && query.length > 0,
    staleTime: 10000,
  });
};

// ======================== ASSET MUTATIONS ========================

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssetRequest }) =>
      api.updateAsset(id, data),
    onSuccess: () => {
      toast.success('Asset updated successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update asset');
    },
  });
};

export const useInstallAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InstallAssetRequest }) =>
      api.installAsset(id, data),
    onSuccess: () => {
      toast.success('Asset installed successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to install asset');
    },
  });
};

export const useUninstallAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.uninstallAsset(id),
    onSuccess: () => {
      toast.success('Asset uninstalled, returned to store');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to uninstall asset');
    },
  });
};

// ======================== TRANSFER MUTATIONS ========================

export const usePendingTransfers = () => {
  return useQuery({
    queryKey: ['asset-transfers', 'pending'],
    queryFn: () => api.getPendingTransfers(),
    staleTime: 30000,
  });
};

export const useTransfersByAsset = (assetId: number) => {
  return useQuery({
    queryKey: ['asset-transfers', 'asset', assetId],
    queryFn: () => api.getTransfersByAsset(assetId),
    enabled: assetId > 0,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferRequest) => api.createTransfer(data),
    onSuccess: () => {
      toast.success('Transfer request created');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-transfers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    },
  });
};

export const useApproveTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.approveTransfer(id),
    onSuccess: () => {
      toast.success('Transfer approved');
      queryClient.invalidateQueries({ queryKey: ['asset-transfers'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to approve transfer'
      );
    },
  });
};

export const useRejectTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.rejectTransfer(id, reason),
    onSuccess: () => {
      toast.success('Transfer rejected');
      queryClient.invalidateQueries({ queryKey: ['asset-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject transfer');
    },
  });
};

export const useReceiveTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.receiveTransfer(id),
    onSuccess: () => {
      toast.success('Asset received successfully');
      queryClient.invalidateQueries({ queryKey: ['asset-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to receive asset');
    },
  });
};

// ======================== MAINTENANCE MUTATIONS ========================

export const usePendingMaintenance = () => {
  return useQuery({
    queryKey: ['asset-maintenance', 'pending'],
    queryFn: () => api.getPendingMaintenance(),
    staleTime: 30000,
  });
};

export const useMaintenanceByAsset = (assetId: number) => {
  return useQuery({
    queryKey: ['asset-maintenance', 'asset', assetId],
    queryFn: () => api.getMaintenanceByAsset(assetId),
    enabled: assetId > 0,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceRequest) => api.createMaintenance(data),
    onSuccess: () => {
      toast.success('Maintenance record created');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create maintenance'
      );
    },
  });
};

export const useCompleteMaintenance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.completeMaintenance(id),
    onSuccess: () => {
      toast.success('Maintenance completed');
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to complete maintenance'
      );
    },
  });
};

// ======================== DISPOSAL ========================

export const useDisposeAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DisposeAssetRequest }) =>
      api.disposeAsset(id, data),
    onSuccess: () => {
      toast.success('Asset disposed successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to dispose asset');
    },
  });
};

// ======================== DASHBOARD ========================

export const useAssetStats = () => {
  return useQuery({
    queryKey: ['assets', 'stats'],
    queryFn: () => api.getStatsByStatus(),
    staleTime: 60000,
  });
};

export const useAssetStatsByCategory = () => {
  return useQuery({
    queryKey: ['assets', 'stats', 'category'],
    queryFn: () => api.getStatsByCategory(),
    staleTime: 60000,
  });
};

export const useAssetStatsByDepartment = () => {
  return useQuery({
    queryKey: ['assets', 'stats', 'department'],
    queryFn: () => api.getStatsByDepartment(),
    staleTime: 60000,
  });
};
