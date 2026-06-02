export interface Payment {
  id: number;
  paymentNumber: string;
  invoiceId: number;
  invoiceNumber?: string;
  poId?: number;
  poNumber?: string;
  grnId?: number;
  grnNumber?: string;
  supplierId: number;
  supplierName?: string;
  paymentDate: string;
  paymentAmount: number;
  paymentMethod?: string;
  paymentReference?: string;
  status: PaymentStatus;
  tdsAmount?: number;
  netAmount?: number;
  remarks?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  createdBy?: string;
  createdByName?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export enum PaymentStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  RTGS = 'RTGS',
  NEFT = 'NEFT',
  UPI = 'UPI',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

export interface CreatePaymentRequest {
  invoiceId: number;
  paymentDate: string;
  paymentAmount: number;
  paymentMethod?: string;
  paymentReference?: string;
  tdsAmount?: number;
  remarks?: string;
  isDraft?: boolean;
}

export interface PaymentEligibility {
  eligible: boolean;
  reason?: string;
  maxPayableAmount: number;
  alreadyPaid: number;
  remainingPayable: number;
  invoiceNumber?: string;
  invoiceStatus?: string;
  grnStatus?: string;
  grnExists: boolean;
}
