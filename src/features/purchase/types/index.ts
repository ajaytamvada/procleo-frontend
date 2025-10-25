export interface PurchaseRequestItem {
  id?: number;
  categoryId: number;
  categoryName?: string;
  subCategoryId: number;
  subCategoryName?: string;
  itemId: number;
  modelName?: string;
  make?: string;
  uomId?: number;
  uomName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  description?: string;
}

export interface PurchaseRequest {
  id?: number;
  requestNumber?: string;
  requestDate: string;
  requestedBy: string;
  departmentId: number;
  departmentName?: string;
  remarks?: string;
  status?: string;
  approvalStatus?: string;
  approvedBy?: number;
  grandTotal?: number;
  sendForApproval?: string;
  locationId: number;
  locationName?: string;
  attachments?: string;
  createdBy?: number;
  createdByName?: string;
  updatedBy?: number;
  createdDate?: string;
  updatedDate?: string;
  budgetHeadId: number;
  budgetHeadName?: string;
  approvalGroupId?: number;
  accountsApprovalStatus?: string;
  adminApprovalStatus?: string;
  purchaseType: string;
  projectCode: string;
  projectName: string;
  items: PurchaseRequestItem[];
}

export interface PurchaseRequestFilters {
  requestNumber?: string;
  requestedBy?: string;
  departmentId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface PRStatus {
  prId: number;
  requestNumber: string;
  requestDate: string;
  requestedBy: string;
  approvedBy: string;
  approvalStatus: string;
  itemId: number;
  model: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  remarks: string;
  rmApprovalStatus: string;
  approvalDate: string | null;
}
