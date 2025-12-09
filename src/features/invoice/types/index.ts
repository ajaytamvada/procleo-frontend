export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  poId?: number;
  poNumber?: string;
  poDate?: string;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  supplierInvoiceNumber?: string;
  invoiceType: string;
  status: InvoiceStatus;
  paymentTerms?: string;
  dueDate?: string;
  grnNumber?: string;
  currency?: string;
  exchangeRate?: number;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  freightCharges?: number;
  otherCharges?: number;
  grandTotal: number;
  paidAmount?: number;
  balanceAmount?: number;
  remarks?: string;
  attachmentPath?: string;
  createdBy?: string;
  createdByName?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedByName?: string;
  modifiedDate?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  poItemId?: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  hsnSacCode?: string;
  poQuantity?: number;
  remainingQuantity?: number;
  invoiceQuantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  baseAmount?: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxableAmount?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  otherTaxRate?: number;
  otherTaxAmount?: number;
  totalTaxAmount?: number;
  totalAmount?: number;
  otherCharges?: number;
  buyback?: number;
  remarks?: string;
}

export interface POItemForInvoice {
  poItemId: number;
  poId: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  poQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  unitOfMeasurement?: string;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  otherTaxRate?: number;
}

export interface PODetailsForInvoice {
  poId: number;
  poNumber: string;
  poDate: string;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  paymentTerms?: string;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  grandTotal?: number;
  currency?: string;
  remarks?: string;
}

export interface POForInvoicing {
  poId: number;
  poNumber: string;
  poDate: string;
  supplierName: string;
  status: string;
}

export interface CreateInvoiceRequest {
  poId: number;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: number;
  remarks?: string;
  attachmentPath?: string;
  freightCharges?: number;
  discountAmount?: number;
  items: InvoiceItemRequest[];
}

export interface InvoiceItemRequest {
  poItemId: number;
  invoiceQuantity: number;
  unitPrice: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  otherTaxRate?: number;
  otherCharges?: number;
  buyback?: number;
  remarks?: string;
}

export interface UpdateInvoiceRequest {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  remarks?: string;
  attachmentPath?: string;
  freightCharges?: number;
  discountAmount?: number;
  items: UpdateInvoiceItemRequest[];
}

export interface UpdateInvoiceItemRequest {
  id?: number;
  poItemId: number;
  invoiceQuantity: number;
  unitPrice: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  otherTaxRate?: number;
  otherCharges?: number;
  buyback?: number;
  remarks?: string;
}

// Direct Invoice Types
export interface CreateDirectInvoiceRequest {
  invoiceNumber: string;
  invoiceDate: string;
  poNumber?: string;
  poDate?: string;
  supplierId: number;
  locationId: number;
  raisedBy?: string;
  remarks?: string;
  attachmentPath?: string;
  isDraft?: boolean;
  items: DirectInvoiceItemRequest[];
}

export interface DirectInvoiceItemRequest {
  itemName: string;
  itemCode?: string;
  manufacturer?: string;
  categoryId?: number;
  subCategoryId?: number;
  assetType?: string;
  uomId?: number;
  quantity: number;
  unitPrice: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  otherTaxRate?: number;
  otherCharges?: number;
  buyback?: number;
  remarks?: string;
}

export interface UpdateDirectInvoiceRequest {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  poNumber?: string;
  poDate?: string;
  supplierId: number;
  locationId: number;
  raisedBy?: string;
  remarks?: string;
  attachmentPath?: string;
  isDraft?: boolean;
  items: UpdateDirectInvoiceItemRequest[];
}

export interface UpdateDirectInvoiceItemRequest {
  id?: number;
  itemName: string;
  itemCode?: string;
  manufacturer?: string;
  categoryId?: number;
  subCategoryId?: number;
  assetType?: string;
  uomId?: number;
  quantity: number;
  unitPrice: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  otherTaxRate?: number;
  otherCharges?: number;
  buyback?: number;
  remarks?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  THREE_WAY_MATCHED = 'THREE_WAY_MATCHED',
  THREE_WAY_MISMATCH = 'THREE_WAY_MISMATCH',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum InvoiceType {
  STANDARD = 'STANDARD',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  ADVANCE = 'ADVANCE',
  PARTIAL = 'PARTIAL',
  FINAL = 'FINAL',
  SERVICE = 'SERVICE',
  PROFORMA = 'PROFORMA',
}
