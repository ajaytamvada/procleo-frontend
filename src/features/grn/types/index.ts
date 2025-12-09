// ========== GRN TYPES ==========

export interface GRN {
  id: number;
  grnNumber: string;
  poId: number;
  poNumber: string;
  poDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  receivedDate: string;
  receivedBy: string;
  receivedByName: string;
  warehouseLocation?: string;
  deliveryChallanNumber?: string;
  deliveryChallanDate?: string;
  vehicleNumber?: string;
  transporterName?: string;
  status: GRNStatus;
  grnType: GRNType;
  remarks?: string;
  qualityCheckStatus?: string;
  qualityCheckRemarks?: string;
  items: GRNItem[];
  totalReceivedValue: number;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedDate?: string;
  isInvoiceCreated: boolean;
}

export interface GRNItem {
  id: number;
  grnId: number;
  poItemId?: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  poQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  pendingQuantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  totalValue: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  binNumber?: string;
  qualityStatus?: QualityStatus;
  qualityRemarks?: string;
  remarks?: string;
}

export interface CreateGRNRequest {
  invoiceId: number;
  receivedDate: string;
  warehouseLocation?: string;
  deliveryChallanNumber?: string;
  deliveryChallanDate?: string;
  vehicleNumber?: string;
  transporterName?: string;
  grnType?: string;
  remarks?: string;
  qualityCheckRemarks?: string;
  items: GRNItemRequest[];
  isDraft?: boolean;
}

export interface UpdateGRNRequest {
  receivedDate: string;
  warehouseLocation?: string;
  deliveryChallanNumber?: string;
  deliveryChallanDate?: string;
  vehicleNumber?: string;
  transporterName?: string;
  grnType?: string;
  remarks?: string;
  qualityCheckRemarks?: string;
  items?: GRNItemRequest[];
}

export interface GRNItemRequest {
  invoiceItemId: number;
  receivedQuantity: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  binNumber?: string;
  qualityStatus?: string;
  qualityRemarks?: string;
  remarks?: string;
}

export interface ApproveGRNRequest {
  action: 'APPROVE' | 'REJECT';
  remarks?: string;
  qualityCheckStatus?: string;
  qualityCheckRemarks?: string;
}

export interface InvoiceForGRN {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: string;
  poId: number;
  poNumber: string;
  poDate?: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  invoiceAmount: number;
  invoiceStatus: string;
  grnStatus?: number; // 0 = Not started, 1 = Partial, 2 = Complete
  items: InvoiceItemForGRN[];
}

export interface InvoiceItemForGRN {
  invoiceItemId: number;
  poItemId?: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  manufacturer?: string;
  category?: string;
  subcategory?: string;
  poQuantity: number;
  invoiceQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  itemTotal: number;
}

export interface POForGRN {
  poId: number;
  poNumber: string;
  poDate: string;
  supplierId: number;
  supplierName: string;
  supplierCode: string;
  supplierAddress?: string;
  supplierContact?: string;
  poAmount: number;
  poStatus: string;
  deliveryLocation?: string;
  expectedDeliveryDate?: string;
}

// ========== ENUMS ==========

export enum GRNStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED = 'FULLY_RECEIVED',
  QUALITY_CHECK_PENDING = 'QUALITY_CHECK_PENDING',
  QUALITY_CHECK_PASSED = 'QUALITY_CHECK_PASSED',
  QUALITY_CHECK_FAILED = 'QUALITY_CHECK_FAILED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum GRNType {
  STANDARD = 'STANDARD',
  PARTIAL = 'PARTIAL',
  RETURN = 'RETURN',
  REPLACEMENT = 'REPLACEMENT',
  SERVICE = 'SERVICE',
}

export enum QualityStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PARTIALLY_PASSED = 'PARTIALLY_PASSED',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

// ========== STATUS DISPLAY HELPERS ==========

export const GRN_STATUS_COLORS: Record<GRNStatus, string> = {
  [GRNStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [GRNStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
  [GRNStatus.APPROVED]: 'bg-green-100 text-green-800',
  [GRNStatus.REJECTED]: 'bg-red-100 text-red-800',
  [GRNStatus.PARTIALLY_RECEIVED]: 'bg-blue-100 text-blue-800',
  [GRNStatus.FULLY_RECEIVED]: 'bg-green-100 text-green-800',
  [GRNStatus.QUALITY_CHECK_PENDING]: 'bg-orange-100 text-orange-800',
  [GRNStatus.QUALITY_CHECK_PASSED]: 'bg-green-100 text-green-800',
  [GRNStatus.QUALITY_CHECK_FAILED]: 'bg-red-100 text-red-800',
  [GRNStatus.CLOSED]: 'bg-gray-100 text-gray-800',
  [GRNStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export const GRN_STATUS_LABELS: Record<GRNStatus, string> = {
  [GRNStatus.DRAFT]: 'Draft',
  [GRNStatus.PENDING_APPROVAL]: 'Pending Approval',
  [GRNStatus.APPROVED]: 'Approved',
  [GRNStatus.REJECTED]: 'Rejected',
  [GRNStatus.PARTIALLY_RECEIVED]: 'Partially Received',
  [GRNStatus.FULLY_RECEIVED]: 'Fully Received',
  [GRNStatus.QUALITY_CHECK_PENDING]: 'Quality Check Pending',
  [GRNStatus.QUALITY_CHECK_PASSED]: 'Quality Check Passed',
  [GRNStatus.QUALITY_CHECK_FAILED]: 'Quality Check Failed',
  [GRNStatus.CLOSED]: 'Closed',
  [GRNStatus.CANCELLED]: 'Cancelled',
};

export const QUALITY_STATUS_COLORS: Record<QualityStatus, string> = {
  [QualityStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [QualityStatus.PASSED]: 'bg-green-100 text-green-800',
  [QualityStatus.FAILED]: 'bg-red-100 text-red-800',
  [QualityStatus.PARTIALLY_PASSED]: 'bg-blue-100 text-blue-800',
  [QualityStatus.NOT_APPLICABLE]: 'bg-gray-100 text-gray-800',
};

export const QUALITY_STATUS_LABELS: Record<QualityStatus, string> = {
  [QualityStatus.PENDING]: 'Pending',
  [QualityStatus.PASSED]: 'Passed',
  [QualityStatus.FAILED]: 'Failed',
  [QualityStatus.PARTIALLY_PASSED]: 'Partially Passed',
  [QualityStatus.NOT_APPLICABLE]: 'Not Applicable',
};
