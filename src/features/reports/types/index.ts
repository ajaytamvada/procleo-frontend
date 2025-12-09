// Purchase Requisition Report Types
export interface PRReport {
  id: number;
  prNumber: string;
  prDate: string;
  requestedBy: string;
  requestedByName: string;
  itemName: string;
  statusOfRM: string;
  quantity: number;
  approxUnitPrice: number;
  totalValue: number;
  department: string;
}

// Invoice Report Types
export interface InvoiceReport {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  poNumber: string;
  poDate: string;
  assetName: string;
  manufacturer: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  attachmentPath: string;
}

// Three Way Match Report Types
export interface ThreeWayMatchReport {
  poId: number;
  poNumber: string;
  poDate: string;
  poValue: number;
  invoiceValue: number;
  paymentValue: number;
  threeWayStatus: 'Open' | 'Close';
  remainingAmount: number;
}

// Vendor Report Types
export interface VendorReport {
  id: number;
  vendorName: string;
  vendorCode: string;
  address: string;
  url: string;
  phoneNumber: string;
  panNumber: string;
  contactName: string;
  email: string;
  totalInvoiceAmount: number;
  totalPaymentAmount: number;
  remainingAmount: number;
  legalForm: string;
}

// Purchase Order Report Types
export interface POReport {
  id: number;
  poNumber: string;
  poDate: string;
  vendorName: string;
  vendorCode: string;
  prNumber: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  expectedDeliveryDate: string;
  createdBy: string;
  createdByName: string;
}

// GRN Report Types
export interface GRNReport {
  id: number;
  grnNumber: string;
  grnDate: string;
  poNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorName: string;
  vendorCode: string;
  status: string;
  totalReceivedValue: number;
  receivedBy: string;
  receivedByName: string;
  qualityCheckStatus: string;
}

// Float RFP Report Types
export interface FloatRFPReport {
  id: number;
  rfqNumber: string;
  rfqDate: string;
  vendorName: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  validTillDate: string;
}

// Submitted RFP Report Types
export interface SubmittedRFPReport {
  id: number;
  quotationNumber: string;
  quotationDate: string;
  vendorName: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  tax1Name: string;
  tax2Name: string;
  tax1Value: number;
  tax2Value: number;
  totalPrice: number;
}

// Date range filter type
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}
