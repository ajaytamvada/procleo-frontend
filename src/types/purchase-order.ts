// Enhanced Purchase Order types for JSP conversion
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  requesterId: string;
  requester: {
    id: string;
    name: string;
    department: string;
    email: string;
  };
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'cancelled'
    | 'short_closed'
    | 'amended'
    | 'ordered'
    | 'received';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  description?: string;
  items: PurchaseOrderItem[];
  attachments: Attachment[];
  approvals: PurchaseOrderApproval[];
  paymentTerms?: string;
  deliveryTerms?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  expectedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  workflow?: {
    currentStage: string;
    nextApprover?: string;
    completedStages: string[];
  };
}

export interface PurchaseOrderItem {
  id: string;
  lineNumber: number;
  productId?: string;
  description: string;
  specification?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  category: string;
  subcategory?: string;
  unit: string;
  brand?: string;
  model?: string;
  partNumber?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface PurchaseOrderApproval {
  id: string;
  approverId: string;
  approver: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  comments?: string;
  timestamp: string;
  sequence: number;
  approvalLimit?: number;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrder['status'][];
  priority?: PurchaseOrder['priority'][];
  vendorId?: string;
  requesterId?: string;
  approverId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  department?: string;
  category?: string;
  poNumbers?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePurchaseOrderData {
  vendorId: string;
  requesterId?: string;
  priority: PurchaseOrder['priority'];
  description?: string;
  items: Omit<
    PurchaseOrderItem,
    'id' | 'lineNumber' | 'taxAmount' | 'totalPrice'
  >[];
  paymentTerms?: string;
  deliveryTerms?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  expectedDelivery?: string;
  attachments?: File[];
  notes?: string;
}

export interface UpdatePurchaseOrderData
  extends Partial<CreatePurchaseOrderData> {
  status?: PurchaseOrder['status'];
  approvalComments?: string;
}

export interface PurchaseOrderStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  cancelled: number;
  shortClosed: number;
  amended: number;
  totalValue: number;
  averageValue: number;
  avgProcessingTime: number; // in days
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    totalOrders: number;
    totalValue: number;
  }>;
}

// JSP Conversion specific types
export interface TabConfig {
  id: string;
  label: string;
  component: string;
  filters?: Partial<PurchaseOrderFilters>;
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}
