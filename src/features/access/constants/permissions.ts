// Available permissions/modules in the system
export interface Permission {
  id: string;
  name: string;
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'purchase_requisition', name: 'Purchase Requisition' },
  { id: 'rfp', name: 'RFP Activity' },
  { id: 'purchase_orders', name: 'Purchase Orders' },
  { id: 'grn', name: 'Goods Receipt Note' },
  { id: 'invoices', name: 'Invoices' },
  { id: 'vendors', name: 'Vendors' },
  { id: 'master_config', name: 'Master Configuration' },
  { id: 'financial_year', name: 'Financial Year' },
  { id: 'budget', name: 'Budget' },
  { id: 'tax_details', name: 'Tax Details' },
  { id: 'payment_terms', name: 'Payment Terms' },
  { id: 'terms_and_conditions', name: 'Terms and Conditions' },
  { id: 'users', name: 'Users' },
  { id: 'reports', name: 'Reports' },
  { id: 'documents', name: 'Documents' },
  { id: 'settings', name: 'Settings' },
];

export const getPermissionName = (id: string): string => {
  return AVAILABLE_PERMISSIONS.find(p => p.id === id)?.name || id;
};

export const parsePermissions = (permissionClass: string | null): string[] => {
  if (!permissionClass) return [];
  return permissionClass
    .split(',')
    .filter(p => p.trim())
    .map(p => p.trim());
};
