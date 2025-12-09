/**
 * TypeScript types for Create RFP from Approved PRs workflow
 */

export interface ApprovedPRForRFP {
  prId: number;
  requestNumber: string;
  requestDate: string;
  requestedBy: string;
  requestedByName: string;
  department: string;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  itemCount: number;
}

export interface ApprovedPRItemForRFP {
  itemId: number; // id_req_asst
  prId: number;
  requestNumber: string;
  itemName: string;
  itemCode: number;
  remarks: string;
  quantity: number;
  indicativePrice: number;
  targetUnitPrice: number;
  grandTotal: number;
  categoryId: number;
  subCategoryId: number;
  description: string;
}

export interface RFPItemFromPR {
  prItemId: number;
  prId: number;
  requestNumber: string;
  itemName: string;
  itemCode: number;
  categoryId: number;
  subCategoryId: number;
  quantity: number;
  indicativePrice: number;
  targetUnitPrice: number;
  remarks: string;
  description: string;
}

export interface CreateRFPFromPRsRequest {
  rfpNumber: string;
  rfpDate: string; // ISO date format
  closingDate: string; // ISO date format
  remarks?: string;
  paymentTerms?: string;
  locationId?: number;
  selectedItems: RFPItemFromPR[];
}
