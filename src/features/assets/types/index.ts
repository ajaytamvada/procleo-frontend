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
  maintenanceIntervalDays?: number;
  lastAuditedDate?: string;
  lastAuditedBy?: string;
  disposalDate?: string;
  disposalMethod?: string;
  disposalValue?: number;
  disposalRequestedBy?: string;
  disposalReason?: string;
  sanitizationReference?: string;
  // Depreciation (config + values computed server-side as of today)
  depreciationMethod?: DepreciationMethod;
  usefulLifeYears?: number;
  salvageValue?: number;
  depreciationRate?: number;
  depreciationStartDate?: string;
  accumulatedDepreciation?: number;
  netBookValue?: number;
  gainLossOnDisposal?: number;
  // Warranty & contracts
  warrantyProvider?: string;
  warrantyExpiryDate?: string;
  amcVendor?: string;
  amcExpiryDate?: string;
  leaseExpiryDate?: string;
  createdBy: string;
  createdDate: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export enum AssetStatus {
  IN_STORE = 'IN_STORE',
  IN_USE = 'IN_USE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  IN_TRANSIT = 'IN_TRANSIT',
  DAMAGED = 'DAMAGED',
  UNDER_REPAIR = 'UNDER_REPAIR',
  READY_FOR_DISPOSAL = 'READY_FOR_DISPOSAL',
  LOST = 'LOST',
  STOLEN = 'STOLEN',
  DISPOSED = 'DISPOSED',
  SOLD = 'SOLD',
}

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.IN_STORE]: 'bg-blue-100 text-blue-800',
  [AssetStatus.IN_USE]: 'bg-green-100 text-green-800',
  [AssetStatus.IN_MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
  [AssetStatus.IN_TRANSIT]: 'bg-purple-100 text-purple-800',
  [AssetStatus.DAMAGED]: 'bg-red-100 text-red-800',
  [AssetStatus.UNDER_REPAIR]: 'bg-orange-100 text-orange-800',
  [AssetStatus.READY_FOR_DISPOSAL]: 'bg-rose-100 text-rose-800',
  [AssetStatus.LOST]: 'bg-red-100 text-red-800',
  [AssetStatus.STOLEN]: 'bg-red-100 text-red-800',
  [AssetStatus.DISPOSED]: 'bg-gray-100 text-gray-800',
  [AssetStatus.SOLD]: 'bg-gray-100 text-gray-600',
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.IN_STORE]: 'In Store',
  [AssetStatus.IN_USE]: 'In Use',
  [AssetStatus.IN_MAINTENANCE]: 'Under Maintenance',
  [AssetStatus.IN_TRANSIT]: 'In Transit',
  [AssetStatus.DAMAGED]: 'Damaged',
  [AssetStatus.UNDER_REPAIR]: 'Under Repair',
  [AssetStatus.READY_FOR_DISPOSAL]: 'Ready for Disposal',
  [AssetStatus.LOST]: 'Lost',
  [AssetStatus.STOLEN]: 'Stolen',
  [AssetStatus.DISPOSED]: 'Disposed',
  [AssetStatus.SOLD]: 'Sold',
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

// ======================== HISTORY / AUDIT TRAIL ========================

export interface AssetHistory {
  id: number;
  assetId: number;
  assetTag?: string;
  eventType: string;
  fromStatus?: string;
  toStatus?: string;
  description?: string;
  referenceType?: string;
  referenceNumber?: string;
  performedBy?: string;
  performedDate: string;
}

/** Filters for the cross-asset trail. Omitted/blank fields match everything. */
export interface AssetTrailFilters {
  assetId?: number;
  assetTag?: string;
  eventType?: string;
  performedBy?: string;
  referenceNumber?: string;
  /** Inclusive, ISO yyyy-MM-dd. */
  fromDate?: string;
  /** Inclusive, ISO yyyy-MM-dd. */
  toDate?: string;
}

export interface AssetTrailPage {
  content: AssetHistory[];
  totalElements: number;
  totalPages: number;
}

/** Grouping used to colour-code the trail table. */
export const ASSET_EVENT_COLORS: Record<string, string> = {
  CREATED: 'bg-blue-100 text-blue-800',
  UPDATED: 'bg-gray-100 text-gray-800',
  ALLOCATED: 'bg-green-100 text-green-800',
  DEALLOCATED: 'bg-amber-100 text-amber-800',
  TRANSFER_INITIATED: 'bg-indigo-100 text-indigo-800',
  TRANSFER_APPROVED: 'bg-indigo-100 text-indigo-800',
  TRANSFER_REJECTED: 'bg-red-100 text-red-800',
  TRANSFER_RECEIVED: 'bg-indigo-100 text-indigo-800',
  MAINTENANCE_STARTED: 'bg-violet-100 text-violet-800',
  MAINTENANCE_COMPLETED: 'bg-violet-100 text-violet-800',
  MAINTENANCE_CANCELLED: 'bg-gray-100 text-gray-800',
  MAINTENANCE_SCHEDULED: 'bg-violet-100 text-violet-800',
  DAMAGE_REPORTED: 'bg-orange-100 text-orange-800',
  DAMAGE_APPROVED: 'bg-orange-100 text-orange-800',
  DAMAGE_REJECTED: 'bg-red-100 text-red-800',
  REPAIR_COMPLETED: 'bg-green-100 text-green-800',
  MARKED_IRREPARABLE: 'bg-red-100 text-red-800',
  REPORTED_MISSING: 'bg-red-100 text-red-800',
  RECOVERED: 'bg-green-100 text-green-800',
  AUDIT_VERIFIED: 'bg-teal-100 text-teal-800',
  DISPOSAL_REQUESTED: 'bg-amber-100 text-amber-800',
  DISPOSAL_REJECTED: 'bg-red-100 text-red-800',
  DISPOSED: 'bg-gray-200 text-gray-900',
};

export const ASSET_EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created',
  UPDATED: 'Updated',
  ALLOCATED: 'Allocated',
  DEALLOCATED: 'Deallocated',
  TRANSFER_INITIATED: 'Transfer Initiated',
  TRANSFER_APPROVED: 'Transfer Approved',
  TRANSFER_REJECTED: 'Transfer Rejected',
  TRANSFER_RECEIVED: 'Transfer Received',
  MAINTENANCE_STARTED: 'Maintenance Started',
  MAINTENANCE_COMPLETED: 'Maintenance Completed',
  MAINTENANCE_CANCELLED: 'Maintenance Cancelled',
  MAINTENANCE_SCHEDULED: 'Maintenance Scheduled',
  DAMAGE_REPORTED: 'Damage Reported',
  DAMAGE_APPROVED: 'Repair Approved',
  DAMAGE_REJECTED: 'Repair Rejected',
  REPAIR_COMPLETED: 'Repair Completed',
  MARKED_IRREPARABLE: 'Marked Irreparable',
  REPORTED_MISSING: 'Reported Missing',
  RECOVERED: 'Recovered',
  AUDIT_VERIFIED: 'Audit Verified',
  DISPOSAL_REQUESTED: 'Disposal Requested',
  DISPOSAL_REJECTED: 'Disposal Rejected',
  DISPOSED: 'Disposed',
};

// ======================== DAMAGE & REPAIR ========================

export interface AssetDamageReport {
  id: number;
  assetId: number;
  assetTag?: string;
  severity?: string;
  description?: string;
  reportedIssue?: string;
  estimatedCost?: number;
  attachmentPath?: string;
  status: string;
  reportedBy?: string;
  reportedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewRemarks?: string;
  repairVendor?: string;
  actualCost?: number;
  repairRemarks?: string;
  resolvedBy?: string;
  resolvedDate?: string;
}

export interface ReportDamageRequest {
  severity: 'MINOR' | 'MAJOR';
  description?: string;
  reportedIssue?: string;
  estimatedCost?: number;
  attachmentPath?: string;
}

export interface ResolveDamageRequest {
  remarks?: string;
}

export interface CompleteRepairRequest {
  resolution: 'REPAIRED' | 'IRREPARABLE';
  actualCost?: number;
  repairVendor?: string;
  remarks?: string;
}

// ======================== REQUEST DTOs ========================

export interface AllocateAssetRequest {
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

export type DisposalMethod =
  | 'SOLD'
  | 'SCRAPPED'
  | 'DONATED'
  | 'RECYCLED'
  | 'RETURNED_TO_VENDOR'
  | 'WRITTEN_OFF';

/** Maker step — flag an in-store asset for disposal. */
export interface RequestDisposalRequest {
  reason: string;
}

/** Checker step — approve & execute disposal. */
export interface DisposeAssetRequest {
  disposalMethod: DisposalMethod;
  sanitizationReference: string;
  disposalValue?: number;
  remarks?: string;
}

export type DepreciationMethod = 'NONE' | 'STRAIGHT_LINE' | 'DECLINING_BALANCE';

// `status` is intentionally absent — it only moves through the guarded
// transitions (allocate, transfer, dispose, ...), never a plain update.
export interface UpdateAssetRequest {
  storageLocation?: string;
  warehouseLocation?: string;
  binNumber?: string;
  serialNumber?: string;
  // Depreciation config
  depreciationMethod?: DepreciationMethod;
  usefulLifeYears?: number;
  salvageValue?: number;
  depreciationRate?: number;
  depreciationStartDate?: string;
  // Warranty & contracts
  warrantyProvider?: string;
  warrantyExpiryDate?: string;
  amcVendor?: string;
  amcExpiryDate?: string;
  leaseExpiryDate?: string;
  // Preventive maintenance
  maintenanceIntervalDays?: number;
  nextMaintenanceDate?: string;
}

// ======================== STATS ========================

export interface AssetStats {
  [key: string]: number;
}
