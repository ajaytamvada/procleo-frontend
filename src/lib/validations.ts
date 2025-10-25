import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');
export const gstSchema = z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number');
export const panSchema = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number');
export const pinCodeSchema = z.string().regex(/^[0-9]{6}$/, 'Please enter a valid PIN code');

// Address schema
export const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: pinCodeSchema,
});

// Vendor validation schema
export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(100, 'Vendor name must be less than 100 characters'),
  code: z.string().min(1, 'Vendor code is required').max(20, 'Vendor code must be less than 20 characters'),
  email: emailSchema,
  contactEmail: emailSchema,
  phone: phoneSchema,
  contactPhone: phoneSchema,
  address: addressSchema,
  gstNumber: gstSchema.optional(),
  panNumber: panSchema.optional(),
  businessType: z.enum(['manufacturer', 'distributor', 'retailer', 'service_provider', 'other']),
  category: z.string().min(1, 'Category is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  creditLimit: z.number().min(0, 'Credit limit must be non-negative').optional(),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  taxId: z.string().optional(),
  bankDetails: z.object({
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    ifscCode: z.string().optional(),
  }).optional(),
  documents: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
  })).optional(),
});

// Purchase Order Item schema
export const purchaseOrderItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, 'Item description is required'),
  specification: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  discount: z.number().min(0, 'Discount must be non-negative').max(100, 'Discount cannot exceed 100%'),
  taxRate: z.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  partNumber: z.string().optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

// Purchase Order schema
export const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  requesterId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  deliveryTerms: z.string().optional(),
  billingAddress: addressSchema.optional(),
  shippingAddress: addressSchema.optional(),
  expectedDelivery: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
}).refine((data) => {
  // Validate that total amount is reasonable
  const totalAmount = data.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + item.taxRate / 100);
    return sum + itemTotal;
  }, 0);
  return totalAmount > 0;
}, {
  message: 'Purchase order must have a positive total amount',
  path: ['items'],
});

// User schema
export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  employeeId: z.string().min(1, 'Employee ID is required').max(20, 'Employee ID must be less than 20 characters'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  role: z.enum(['admin', 'manager', 'employee', 'finance', 'procurement', 'approver']),
  reportingManager: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  costCenter: z.string().optional(),
  approvalLimit: z.number().min(0, 'Approval limit must be non-negative').optional(),
  isActive: z.boolean(),
  permissions: z.array(z.string()).optional(),
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Asset schema
export const assetSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative').optional(),
  vendor: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  assignedTo: z.string().optional(),
  status: z.enum(['available', 'assigned', 'maintenance', 'disposed', 'lost']),
  warrantyExpiry: z.string().optional(),
  amcExpiry: z.string().optional(),
  depreciation: z.object({
    method: z.enum(['straight_line', 'declining_balance', 'custom']),
    rate: z.number().min(0).max(100),
    residualValue: z.number().min(0),
  }).optional(),
});

// Search/Filter schemas
export const purchaseOrderFiltersSchema = z.object({
  status: z.array(z.enum(['draft', 'pending_approval', 'approved', 'cancelled', 'short_closed', 'amended', 'ordered', 'received'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  vendorId: z.string().optional(),
  requesterId: z.string().optional(),
  approverId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  poNumbers: z.array(z.string()).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Export validation functions
export type VendorFormData = z.infer<typeof vendorSchema>;
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type AssetFormData = z.infer<typeof assetSchema>;
export type PurchaseOrderFiltersData = z.infer<typeof purchaseOrderFiltersSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;

// Utility validation functions
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const getFieldError = (errors: Record<string, string> | undefined, fieldName: string): string | undefined => {
  return errors?.[fieldName];
};