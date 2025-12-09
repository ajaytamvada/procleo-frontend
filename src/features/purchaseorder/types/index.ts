export interface PurchaseOrderItem {
  id?: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  remarks?: string;
  deliveryDate?: string;
  quantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  tax1Type?: string;
  tax1Rate?: number;
  tax1Amount?: number;
  tax2Type?: string;
  tax2Rate?: number;
  tax2Amount?: number;
  tax1Value?: number;
  tax2Value?: number;
  totalAmount?: number;
  grandTotal?: number;
  category?: string;
  subCategory?: string;
  specifications?: string;
  receivedQuantity?: number;
  pendingQuantity?: number;
  invoicedQuantity?: number;
}

export interface PurchaseOrder {
  id?: number;
  poNumber: string;
  quotationNumber?: string;
  rfpNumber?: string;
  prNumber?: string;
  poDate: string;
  deliveryDate?: string;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  raisedBy?: string;
  department?: string;
  approvalGroup?: string;
  paymentTerms?: string;
  termsConditions?: string;
  shipToAddress?: string;
  billToAddress?: string;
  descriptionTC?: string;
  remarks?: string;
  status?: POStatus;
  poType?: POType;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  grandTotal?: number;
  currency?: string;
  items?: PurchaseOrderItem[];
  approvedBy?: string;
  approvedDate?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  isGrnCreated?: boolean;
  isInvoiceCreated?: boolean;
}

export enum POStatus {
  DRAFT = 'DRAFT',
  CREATED = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  PARTIALLY_INVOICED = 'PARTIALLY_INVOICED',
  INVOICED = 'INVOICED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum POType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  SERVICE = 'SERVICE',
  CAPEX = 'CAPEX',
  OPEX = 'OPEX',
}

export interface GRNItem {
  id?: number;
  poItemId?: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  poQuantity: number;
  receivedQuantity: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  pendingQuantity?: number;
  unitOfMeasurement?: string;
  unitPrice?: number;
  totalValue?: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  binNumber?: string;
  qualityStatus?: string;
  qualityRemarks?: string;
  remarks?: string;
}

export interface GRN {
  id?: number;
  grnNumber: string;
  poId: number;
  poNumber: string;
  poDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  receivedDate: string;
  receivedBy?: string;
  warehouseLocation?: string;
  deliveryChallanNumber?: string;
  deliveryChallanDate?: string;
  vehicleNumber?: string;
  transporterName?: string;
  status?: GRNStatus;
  grnType?: GRNType;
  remarks?: string;
  qualityCheckStatus?: string;
  qualityCheckRemarks?: string;
  items?: GRNItem[];
  totalReceivedValue?: number;
  approvedBy?: string;
  approvedDate?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  isInvoiceCreated?: boolean;
}

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

export interface InvoiceItem {
  id?: number;
  poItemId?: number;
  grnItemId?: number;
  itemName: string;
  itemCode?: string;
  itemDescription?: string;
  hsnSacCode?: string;
  poQuantity?: number;
  grnQuantity?: number;
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
  glAccountCode?: string;
  costCenter?: string;
  projectCode?: string;
  remarks?: string;
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  invoiceDate: string;
  poId?: number;
  poNumber?: string;
  grnId?: number;
  grnNumber?: string;
  supplierId: number;
  supplierName: string;
  supplierCode?: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: string;
  invoiceType?: InvoiceType;
  status?: InvoiceStatus;
  paymentTerms?: string;
  dueDate?: string;
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
  items?: InvoiceItem[];
  billToAddress?: string;
  shipToAddress?: string;
  remarks?: string;
  attachmentPath?: string;
  threeWayMatchStatus?: string;
  threeWayMatchRemarks?: string;
  approvedBy?: string;
  approvedDate?: string;
  paymentReference?: string;
  paymentDate?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
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
