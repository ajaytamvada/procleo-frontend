import { apiClient } from '@/lib/api';
import type {
  Asset,
  AssetTransfer,
  AssetMaintenance,
  AssetStats,
  InstallAssetRequest,
  CreateTransferRequest,
  CreateMaintenanceRequest,
  DisposeAssetRequest,
  UpdateAssetRequest,
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

// ======================== INSTALLATION ========================

export const installAsset = async (
  id: number,
  data: InstallAssetRequest
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/install`, data);
  return response.data;
};

export const uninstallAsset = async (id: number): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/uninstall`);
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

export const disposeAsset = async (
  id: number,
  data: DisposeAssetRequest
): Promise<Asset> => {
  const response = await apiClient.post<Asset>(`/assets/${id}/dispose`, data);
  return response.data;
};

export const getDisposedAssets = async (): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets/disposed');
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
  getAssetsByStatus,
  getAssetsByDepartment,
  searchAssets,
  installAsset,
  uninstallAsset,
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
  disposeAsset,
  getDisposedAssets,
  getStatsByStatus,
  getStatsByCategory,
  getStatsByDepartment,
};
