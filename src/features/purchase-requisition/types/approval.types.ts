/**
 * TypeScript types for PR Approval functionality
 */

/**
 * List item for PRs pending approval
 */
export interface PRApprovalListItem {
  prId: number;
  requestNumber: string;
  requestDate: string;
  requestedBy: string;
  department: string;
  createdBy: string;
  createdDate: string;
}

/**
 * Item details within a PR for approval
 */
export interface PRApprovalItem {
  itemId: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  productId: number;
  modelName: string;
  make: string;
  uomId: number;
  uomName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  rmApprovalStatus: string;
  approvalRemarks: string;
}

/**
 * Full PR details for approval screen
 */
export interface PRApprovalDetail {
  // PR Header Information
  prId: number;
  requestNumber: string;
  requestDate: string;
  requestedBy: string;
  employeeCode: string;
  designation: string;
  department: string;
  locationId: number;
  locationName: string;
  purchaseType: string;
  projectCode: string;
  projectName: string;
  remarks: string;
  attachments: string;

  // Items for approval
  items: PRApprovalItem[];
}

/**
 * Item in approval request payload
 */
export interface ApprovalItemRequest {
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  remarks?: string;
}

/**
 * Request payload for approving/rejecting PR items
 */
export interface PRApprovalRequest {
  prId: number;
  approvalStatus: 'Accepted' | 'Rejected';
  remarks?: string;
  items: ApprovalItemRequest[];
}
