export interface RFPItem {
  id?: number;
  itemName: string;
  itemCode?: string;
  remarks?: string;
  prNumber?: string;
  quantity: number;
  unitOfMeasurement?: string;
  category?: string;
  subCategory?: string;
  indicativePrice?: number;
  unitPrice?: number;
  grandTotal?: number;
  specifications?: string;
  deliveryRequirements?: string;
}

export interface RFPSupplier {
  id?: number;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  companyAddress?: string;
  isSelected?: boolean;
  selectionDate?: string;
  invitationSent?: boolean;
  invitationSentDate?: string;
  responseReceived?: boolean;
  responseDate?: string;
  status?: SupplierStatus;
  remarks?: string;
}

export interface RFPQuotation {
  id?: number;
  rfpId: number;
  supplierId: number;
  supplierName?: string;
  quotationNumber?: string;
  quotationDate?: string;
  validityDate?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  totalAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  netAmount?: number;
  currency?: string;
  status?: QuotationStatus;
  technicalScore?: number;
  commercialScore?: number;
  overallScore?: number;
  ranking?: number;
  isSelected?: boolean;
  negotiationNotes?: string;
  remarks?: string;
  items?: RFPQuotationItem[];
  submittedDate?: string;
  evaluatedBy?: string;
  evaluatedDate?: string;
}

export interface RFPQuotationItem {
  id?: number;
  rfpItemId: number;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  totalPrice?: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  netPrice?: number;
  deliveryTime?: string;
  warrantyPeriod?: string;
  specifications?: string;
  remarks?: string;
  complianceStatus?: string;
  technicalCompliance?: boolean;
  commercialCompliance?: boolean;
}

export interface RFP {
  id?: number;
  rfpNumber: string;
  prNumber?: string;
  requestDate: string;
  closingDate: string;
  requestedBy?: string;
  department?: string;
  approvalGroup?: string;
  paymentTerms?: string;
  remarks?: string;
  status?: RFPStatus;
  totalAmount?: number;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  items?: RFPItem[];
  suppliers?: RFPSupplier[];
  quotations?: RFPQuotation[];
  totalSuppliers?: number;
  respondedSuppliers?: number;
  pendingSuppliers?: number;
}

export enum RFPStatus {
  DRAFT = 'DRAFT',
  CREATED = 'CREATED',
  FLOATED = 'FLOATED',
  IN_REVIEW = 'IN_REVIEW',
  NEGOTIATION = 'NEGOTIATION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum SupplierStatus {
  INVITED = 'INVITED',
  RESPONDED = 'RESPONDED',
  SHORTLISTED = 'SHORTLISTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_EVALUATION = 'UNDER_EVALUATION',
  NEGOTIATION = 'NEGOTIATION',
  SHORTLISTED = 'SHORTLISTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface RFPFormData {
  rfpNumber: string;
  prNumber?: string;
  requestDate: string;
  closingDate: string;
  requestedBy?: string;
  department?: string;
  approvalGroup?: string;
  paymentTerms?: string;
  remarks?: string;
  items: RFPItem[];
  supplierIds?: number[];
}

export interface RFPFilterParams {
  status?: RFPStatus;
  department?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}