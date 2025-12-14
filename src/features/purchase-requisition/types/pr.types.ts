/**
 * TypeScript types for Purchase Requisition management
 */

/**
 * PR list item for displaying in tables
 */
export interface PRListItem {
  id: number;
  requestNumber: string;
  requestDate: string;
  requestedBy: string;
  requestedByName?: string;
  department?: string;
  departmentId: number;
  departmentName?: string;
  createdBy: number;
  createdByName?: string;
  createdDate: string;
  status: string;
  sendForApproval: string;
  grandTotal?: number;
  purchaseType?: string;
  projectCode?: string;
  projectName?: string;
}

/**
 * PR item/line item details
 */
export interface PRItem {
  id: number;
  categoryId: number;
  categoryName?: string;
  subCategoryId: number;
  subCategoryName?: string;
  productId: number;
  productName?: string;
  modelName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  make?: string;
  uomId?: number;
  uomName?: string;
}

/**
 * Full PR details with items
 */
export interface PRDetail {
  id: number;
  requestNumber: string;
  requestDate: string;
  requestedBy: number;
  requestedByName?: string;
  departmentId: number;
  departmentName?: string;
  locationId: number;
  locationName?: string;
  approvalGroupId?: number;
  purchaseType?: string;
  projectCode?: string;
  projectName?: string;
  remarks?: string;
  status: string;
  sendForApproval: string;
  grandTotal: number;
  attachments?: string;
  items: PRItem[];
}

/**
 * Create/Update PR request payload
 */
export interface PRRequest {
  requestedBy: number;
  departmentId: number;
  locationId: number;
  requestDate: string;
  approvalGroupId?: number;
  purchaseType?: string;
  projectCode?: string;
  projectName?: string;
  remarks?: string;
  items: PRItemRequest[];
}

/**
 * PR item in request payload
 */
export interface PRItemRequest {
  id?: number;
  categoryId: number;
  subCategoryId: number;
  productId: number;
  modelName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  make?: string;
  uomId?: number;
}
