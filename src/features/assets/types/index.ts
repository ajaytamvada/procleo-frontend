// ======================== ASSET ========================

export interface Asset {
  id: number;
  assetTag: string;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  serialNumber?: string;
  batchNumber?: string;
  manufacturer?: string;
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
  modelId?: number;
  unitPrice?: number;
  status: AssetStatus;
  warehouseLocation?: string;
  storageLocation?: string;
  binNumber?: string;
  installedLocationId?: number;
  installedLocationName?: string;
  departmentId?: number;
  departmentName?: string;
  assignedTo?: number;
  assignedToName?: string;
  installDate?: string;
  grnId: number;
  grnNumber: string;
  grnItemId: number;
  poId?: number;
  poNumber?: string;
  prNumber?: string;
  supplierId?: number;
  supplierName?: string;
  invoiceNumber?: string;
  receivedDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  disposalDate?: string;
  disposalMethod?: string;
  disposalValue?: number;
  createdBy: string;
  createdDate: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export enum AssetStatus {
  IN_STORE = 'IN_STORE',
  INSTALLED = 'INSTALLED',
  IN_USE = 'IN_USE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  IN_TRANSIT = 'IN_TRANSIT',
  DISPOSED = 'DISPOSED',
  SOLD = 'SOLD',
  DAMAGED = 'DAMAGED',
}

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.IN_STORE]: 'bg-blue-100 text-blue-800',
  [AssetStatus.INSTALLED]: 'bg-indigo-100 text-indigo-800',
  [AssetStatus.IN_USE]: 'bg-green-100 text-green-800',
  [AssetStatus.IN_MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
  [AssetStatus.IN_TRANSIT]: 'bg-purple-100 text-purple-800',
  [AssetStatus.DISPOSED]: 'bg-gray-100 text-gray-800',
  [AssetStatus.SOLD]: 'bg-gray-100 text-gray-600',
  [AssetStatus.DAMAGED]: 'bg-red-100 text-red-800',
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.IN_STORE]: 'In Store',
  [AssetStatus.INSTALLED]: 'Installed',
  [AssetStatus.IN_USE]: 'In Use',
  [AssetStatus.IN_MAINTENANCE]: 'Under Maintenance',
  [AssetStatus.IN_TRANSIT]: 'In Transit',
  [AssetStatus.DISPOSED]: 'Disposed',
  [AssetStatus.SOLD]: 'Sold',
  [AssetStatus.DAMAGED]: 'Damaged',
};

// ======================== TRANSFER ========================

export interface AssetTransfer {
  id: number;
  transferNumber: string;
  assetId: number;
  assetTag: string;
  transferType: string;
  fromLocationId?: number;
  fromLocationName?: string;
  fromDepartmentId?: number;
  fromDepartmentName?: string;
  fromEmployeeId?: number;
  fromEmployeeName?: string;
  toLocationId?: number;
  toLocationName?: string;
  toDepartmentId?: number;
  toDepartmentName?: string;
  toEmployeeId?: number;
  toEmployeeName?: string;
  status: string;
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  receivedBy?: string;
  receivedDate?: string;
  remarks?: string;
  rejectionReason?: string;
}

// ======================== MAINTENANCE ========================

export interface AssetMaintenance {
  id: number;
  assetId: number;
  assetTag: string;
  maintenanceType: string;
  description?: string;
  reportedIssue?: string;
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  cost?: number;
  vendorName?: string;
  createdBy: string;
  createdDate: string;
  completedBy?: string;
  remarks?: string;
}

// ======================== REQUEST DTOs ========================

export interface InstallAssetRequest {
  employeeId: number;
  locationId?: number;
  installDate?: string;
  remarks?: string;
}

export interface CreateTransferRequest {
  assetId: number;
  transferType: 'LOCATION' | 'DEPARTMENT' | 'EMPLOYEE';
  toLocationId?: number;
  toDepartmentId?: number;
  toEmployeeId?: number;
  remarks?: string;
}

export interface CreateMaintenanceRequest {
  assetId: number;
  maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'REPAIR' | 'INSPECTION';
  description?: string;
  reportedIssue?: string;
  scheduledDate?: string;
  cost?: number;
  vendorName?: string;
  remarks?: string;
}

export interface DisposeAssetRequest {
  disposalMethod: 'SOLD' | 'SCRAPPED' | 'DONATED' | 'WRITTEN_OFF';
  disposalValue?: number;
  remarks?: string;
}

export interface UpdateAssetRequest {
  storageLocation?: string;
  warehouseLocation?: string;
  binNumber?: string;
  serialNumber?: string;
  status?: string;
  remarks?: string;
}

// ======================== STATS ========================

export interface AssetStats {
  [key: string]: number;
}
