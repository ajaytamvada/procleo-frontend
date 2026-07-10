import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as api from '../api/assetsApi';
import type {
  AssetTrailFilters,
  AllocateAssetRequest,
  CreateTransferRequest,
  CreateMaintenanceRequest,
  DisposeAssetRequest,
  RequestDisposalRequest,
  UpdateAssetRequest,
  ReportDamageRequest,
  ResolveDamageRequest,
  CompleteRepairRequest,
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

export const useAssetHistory = (assetId: number) => {
  return useQuery({
    // Keyed under ['assets', ...] so the existing invalidateQueries(['assets'])
    // in every lifecycle mutation refreshes the timeline automatically.
    queryKey: ['assets', assetId, 'history'],
    queryFn: () => api.getAssetHistory(assetId),
    enabled: assetId > 0,
  });
};

export const useAssetTrail = (
  filters: AssetTrailFilters,
  page = 0,
  size = 25
) => {
  return useQuery({
    // Deliberately NOT keyed under ['assets'] — the trail is a report, and we
    // don't want every lifecycle mutation refetching a possibly-large page.
    queryKey: ['asset-trail', filters, page, size],
    queryFn: () => api.getAssetTrail(filters, page, size),
    staleTime: 30000,
    // Keeps the current page on screen while the next one loads, instead of
    // flashing the empty state on every page/filter change.
    placeholderData: keepPreviousData,
  });
};

export const useTrailEventTypes = () => {
  return useQuery({
    queryKey: ['asset-trail', 'event-types'],
    queryFn: () => api.getTrailEventTypes(),
    staleTime: Infinity, // enum values; they only change on deploy
  });
};

export const useExpiringAssets = (days = 30, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'expiring', days],
    queryFn: () => api.getExpiringAssets(days),
    enabled,
    staleTime: 60000,
  });
};

export const useAuditReconciliation = (staleDays = 180, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'audit-reconciliation', staleDays],
    queryFn: () => api.getAuditReconciliation(staleDays),
    enabled,
    staleTime: 60000,
  });
};

export const useMaintenanceDue = (days = 7, enabled = true) => {
  return useQuery({
    queryKey: ['assets', 'maintenance-due', days],
    queryFn: () => api.getMaintenanceDue(days),
    enabled,
    staleTime: 60000,
  });
};

export const useReportMissing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      type,
      remarks,
    }: {
      id: number;
      type: 'LOST' | 'STOLEN';
      remarks?: string;
    }) => api.reportMissing(id, type, remarks),
    onSuccess: () => {
      toast.success('Asset reported missing');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report missing');
    },
  });
};

export const useRecoverAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.recoverAsset(id),
    onSuccess: () => {
      toast.success('Asset recovered and returned to store');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to recover asset');
    },
  });
};

export const useRecordAudit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks?: string }) =>
      api.recordAudit(id, remarks),
    onSuccess: () => {
      toast.success('Audit recorded — asset verified present');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record audit');
    },
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

export const useAllocateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AllocateAssetRequest }) =>
      api.allocateAsset(id, data),
    onSuccess: () => {
      toast.success('Asset allocated successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to allocate asset');
    },
  });
};

export const useDeallocateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deallocateAsset(id),
    onSuccess: () => {
      toast.success('Asset deallocated, returned to store');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to deallocate asset'
      );
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

export const useRequestDisposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RequestDisposalRequest }) =>
      api.requestDisposal(id, data),
    onSuccess: () => {
      toast.success('Disposal requested — awaiting approval');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to request disposal'
      );
    },
  });
};

export const useApproveDisposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DisposeAssetRequest }) =>
      api.approveDisposal(id, data),
    onSuccess: () => {
      toast.success('Asset disposed successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to approve disposal'
      );
    },
  });
};

export const useRejectDisposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.rejectDisposal(id, reason),
    onSuccess: () => {
      toast.success('Disposal request rejected — asset returned to store');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject disposal');
    },
  });
};

// ======================== DAMAGE & REPAIR ========================

export const useDamageByAsset = (assetId: number) => {
  return useQuery({
    // Keyed under ['assets', ...] so lifecycle mutations refresh it automatically.
    queryKey: ['assets', assetId, 'damage'],
    queryFn: () => api.getDamageByAsset(assetId),
    enabled: assetId > 0,
  });
};

export const usePendingDamage = () => {
  return useQuery({
    queryKey: ['asset-damage', 'pending'],
    queryFn: () => api.getPendingDamage(),
    staleTime: 30000,
  });
};

export const useUnderRepair = () => {
  return useQuery({
    queryKey: ['asset-damage', 'under-repair'],
    queryFn: () => api.getUnderRepair(),
    staleTime: 30000,
  });
};

export const useAllDamage = () => {
  return useQuery({
    queryKey: ['asset-damage', 'all'],
    queryFn: () => api.getAllDamage(),
    staleTime: 30000,
  });
};

export const useReportDamage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReportDamageRequest }) =>
      api.reportDamage(id, data),
    onSuccess: () => {
      toast.success('Damage reported');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-damage'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to report damage');
    },
  });
};

export const useApproveDamage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ResolveDamageRequest }) =>
      api.approveDamage(id, data),
    onSuccess: () => {
      toast.success('Repair approved — asset under repair');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-damage'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve repair');
    },
  });
};

export const useRejectDamage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ResolveDamageRequest }) =>
      api.rejectDamage(id, data),
    onSuccess: () => {
      toast.success('Repair rejected');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-damage'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject repair');
    },
  });
};

export const useCompleteRepair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteRepairRequest }) =>
      api.completeRepair(id, data),
    onSuccess: () => {
      toast.success('Repair completed');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-damage'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete repair');
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
