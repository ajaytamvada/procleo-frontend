import { apiClient } from '@/lib/api';
import type {
  Asset,
  AssetTransfer,
  AssetMaintenance,
  AssetHistory,
  AssetTrailFilters,
  AssetTrailPage,
  AssetDamageReport,
  AssetStats,
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

// ======================== ASSET CRUD ========================

export const getAssets = async (
  page = 0,
  size = 20
): Promise<{ content: Asset[]; totalElements: number; totalPages: number }> => {
  const response = await apiClient.get(
    `/assets?page=${page}&size=${size}&sort=createdDate,desc`
  );
  return response.data;
};

export const getAssetById = async (id: number): Promise<Asset> => {
  const response = await apiClient.get<Asset>(`/assets/${id}`);
  return response.data;
};

export const getAssetByTag = async (tag: string): Promise<Asset> => {
  const response = await apiClient.get<Asset>(`/assets/tag/${tag}`);
  return response.data;
};

export const updateAsset = async (
  id: number,
  data: UpdateAssetRequest
): Promise<Asset> => {
  const response = await apiClient.put<Asset>(`/assets/${id}`, data);
  return response.data;
};

export const getAssetsByGrn = async (grnId: number): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>(`/assets/grn/${grnId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getAssetHistory = async (id: number): Promise<AssetHistory[]> => {
  const response = await apiClient.get<AssetHistory[]>(`/assets/${id}/history`);
  return Array.isArray(response.data) ? response.data : [];
};

// ======================== AUDIT TRAIL (cross-asset) ========================

// Blank strings must not reach the API as filters — the backend treats them as
// "no filter" anyway, but stripping them here keeps the query string readable.
const toTrailParams = (filters: AssetTrailFilters) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );

export const getAssetTrail = async (
  filters: AssetTrailFilters = {},
  page = 0,
  size = 25
): Promise<AssetTrailPage> => {
  const response = await apiClient.get<AssetTrailPage>('/assets/history', {
    params: { ...toTrailParams(filters), page, size },
  });
  return {
    content: Array.isArray(response.data?.content) ? response.data.content : [],
    totalElements: response.data?.totalElements ?? 0,
    totalPages: response.data?.totalPages ?? 0,
  };
};

// Flat, unpaged rows for the Excel export. Backend caps the result at 10,000.
export const getAssetTrailForExport = async (
  filters: AssetTrailFilters = {}
): Promise<AssetHistory[]> => {
  const response = await apiClient.get<AssetHistory[]>(
    '/assets/history/export',
    {
      params: toTrailParams(filters),
    }
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getTrailEventTypes = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/assets/history/event-types');
  return Array.isArray(response.data) ? response.data : [];
};

export const getAssetsByStatus = async (status: string): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>(`/assets/status/${status}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getAssetsByDepartment = async (
  deptId: number
): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>(`/assets/department/${deptId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const searchAssets = async (query: string): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>(
    `/assets/search?q=${encodeURIComponent(query)}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

// ======================== ALLOCATION ========================

export const allocateAsset = async (
  id: number,
  data: AllocateAssetRequest
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/allocate`, data);
  return response.data;
};

export const deallocateAsset = async (id: number): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/deallocate`);
  return response.data;
};

// ======================== DAMAGE & REPAIR ========================

export const reportDamage = async (
  id: number,
  data: ReportDamageRequest
): Promise<AssetDamageReport> => {
  const response = await apiClient.post<AssetDamageReport>(
    `/assets/${id}/damage`,
    data
  );
  return response.data;
};

export const getDamageByAsset = async (
  id: number
): Promise<AssetDamageReport[]> => {
  const response = await apiClient.get<AssetDamageReport[]>(
    `/assets/${id}/damage`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getAllDamage = async (): Promise<AssetDamageReport[]> => {
  const response = await apiClient.get<AssetDamageReport[]>('/assets/damage');
  return Array.isArray(response.data) ? response.data : [];
};

export const getPendingDamage = async (): Promise<AssetDamageReport[]> => {
  const response = await apiClient.get<AssetDamageReport[]>(
    '/assets/damage/pending'
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getUnderRepair = async (): Promise<AssetDamageReport[]> => {
  const response = await apiClient.get<AssetDamageReport[]>(
    '/assets/damage/under-repair'
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const approveDamage = async (
  reportId: number,
  data?: ResolveDamageRequest
): Promise<AssetDamageReport> => {
  const response = await apiClient.post<AssetDamageReport>(
    `/assets/damage/${reportId}/approve`,
    data ?? {}
  );
  return response.data;
};

export const rejectDamage = async (
  reportId: number,
  data?: ResolveDamageRequest
): Promise<AssetDamageReport> => {
  const response = await apiClient.post<AssetDamageReport>(
    `/assets/damage/${reportId}/reject`,
    data ?? {}
  );
  return response.data;
};

export const completeRepair = async (
  reportId: number,
  data: CompleteRepairRequest
): Promise<AssetDamageReport> => {
  const response = await apiClient.post<AssetDamageReport>(
    `/assets/damage/${reportId}/complete`,
    data
  );
  return response.data;
};

// ======================== TRANSFER ========================

export const createTransfer = async (
  data: CreateTransferRequest
): Promise<AssetTransfer> => {
  const response = await apiClient.post<AssetTransfer>(
    '/assets/transfers',
    data
  );
  return response.data;
};

export const getTransfersByAsset = async (
  assetId: number
): Promise<AssetTransfer[]> => {
  const response = await apiClient.get<AssetTransfer[]>(
    `/assets/transfers/asset/${assetId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getPendingTransfers = async (): Promise<AssetTransfer[]> => {
  const response = await apiClient.get<AssetTransfer[]>(
    '/assets/transfers/pending'
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const approveTransfer = async (id: number): Promise<AssetTransfer> => {
  const response = await apiClient.post<AssetTransfer>(
    `/assets/transfers/${id}/approve`
  );
  return response.data;
};

export const rejectTransfer = async (
  id: number,
  reason?: string
): Promise<AssetTransfer> => {
  const response = await apiClient.post<AssetTransfer>(
    `/assets/transfers/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`
  );
  return response.data;
};

export const receiveTransfer = async (id: number): Promise<AssetTransfer> => {
  const response = await apiClient.post<AssetTransfer>(
    `/assets/transfers/${id}/receive`
  );
  return response.data;
};

// ======================== MAINTENANCE ========================

export const createMaintenance = async (
  data: CreateMaintenanceRequest
): Promise<AssetMaintenance> => {
  const response = await apiClient.post<AssetMaintenance>(
    '/assets/maintenance',
    data
  );
  return response.data;
};

export const getMaintenanceByAsset = async (
  assetId: number
): Promise<AssetMaintenance[]> => {
  const response = await apiClient.get<AssetMaintenance[]>(
    `/assets/maintenance/asset/${assetId}`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getPendingMaintenance = async (): Promise<AssetMaintenance[]> => {
  const response = await apiClient.get<AssetMaintenance[]>(
    '/assets/maintenance/pending'
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const completeMaintenance = async (
  id: number
): Promise<AssetMaintenance> => {
  const response = await apiClient.put<AssetMaintenance>(
    `/assets/maintenance/${id}/complete`
  );
  return response.data;
};

export const cancelMaintenance = async (
  id: number
): Promise<AssetMaintenance> => {
  const response = await apiClient.put<AssetMaintenance>(
    `/assets/maintenance/${id}/cancel`
  );
  return response.data;
};

// ======================== DISPOSAL ========================

// Maker: flag an in-store asset for disposal.
export const requestDisposal = async (
  id: number,
  data: RequestDisposalRequest
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(
    `/assets/${id}/dispose/request`,
    data
  );
  return response.data;
};

// Checker: approve & execute disposal (approver must differ from requester).
export const approveDisposal = async (
  id: number,
  data: DisposeAssetRequest
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(
    `/assets/${id}/dispose/approve`,
    data
  );
  return response.data;
};

// Reject a pending disposal request; asset returns to store.
export const rejectDisposal = async (
  id: number,
  reason?: string
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(
    `/assets/${id}/dispose/reject`,
    null,
    { params: reason ? { reason } : {} }
  );
  return response.data;
};

export const getDisposedAssets = async (): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets/disposed');
  return Array.isArray(response.data) ? response.data : [];
};

// Assets whose warranty/AMC/lease expires within `days` (default 30).
export const getExpiringAssets = async (days = 30): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets/expiring', {
    params: { days },
  });
  return Array.isArray(response.data) ? response.data : [];
};

// ======================== MISSING / AUDIT / PM ========================

export const reportMissing = async (
  id: number,
  type: 'LOST' | 'STOLEN',
  remarks?: string
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/missing`, null, {
    params: { type, ...(remarks ? { remarks } : {}) },
  });
  return response.data;
};

export const recoverAsset = async (id: number): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/recover`);
  return response.data;
};

export const recordAudit = async (
  id: number,
  remarks?: string
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/audit`, null, {
    params: remarks ? { remarks } : {},
  });
  return response.data;
};

export const getAuditReconciliation = async (
  staleDays = 180
): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>(
    '/assets/audit/reconciliation',
    {
      params: { staleDays },
    }
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getMaintenanceDue = async (days = 7): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets/maintenance/due', {
    params: { days },
  });
  return Array.isArray(response.data) ? response.data : [];
};

// ======================== DASHBOARD ========================

export const getStatsByStatus = async (): Promise<AssetStats> => {
  const response = await apiClient.get<AssetStats>('/assets/stats');
  return response.data;
};

export const getStatsByCategory = async (): Promise<AssetStats> => {
  const response = await apiClient.get<AssetStats>('/assets/stats/by-category');
  return response.data;
};

export const getStatsByDepartment = async (): Promise<AssetStats> => {
  const response = await apiClient.get<AssetStats>(
    '/assets/stats/by-department'
  );
  return response.data;
};

// Export as object
export const assetsApi = {
  getAssets,
  getAssetById,
  getAssetByTag,
  updateAsset,
  getAssetsByGrn,
  getAssetHistory,
  getAssetTrail,
  getAssetTrailForExport,
  getTrailEventTypes,
  getAssetsByStatus,
  getAssetsByDepartment,
  searchAssets,
  allocateAsset,
  deallocateAsset,
  createTransfer,
  getTransfersByAsset,
  getPendingTransfers,
  approveTransfer,
  rejectTransfer,
  receiveTransfer,
  createMaintenance,
  getMaintenanceByAsset,
  getPendingMaintenance,
  completeMaintenance,
  cancelMaintenance,
  requestDisposal,
  approveDisposal,
  rejectDisposal,
  getDisposedAssets,
  getExpiringAssets,
  reportMissing,
  recoverAsset,
  recordAudit,
  getAuditReconciliation,
  getMaintenanceDue,
  getStatsByStatus,
  getStatsByCategory,
  getStatsByDepartment,
};
