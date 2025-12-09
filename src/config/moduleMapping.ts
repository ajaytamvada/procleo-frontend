import { createPathRegex } from '@/utils/route-utils';

/**
 * Maps route paths to module codes for permission checking
 * This ensures consistent mapping between backend modules and frontend routes
 */

export const routeToModuleMap: Record<string, string> = {
  '/': 'DASHBOARD',
  '/purchase-requisition': 'PR',
  '/purchase-requisition/create': 'PR_CREATE',
  '/purchase-requisition/manage': 'PR_MANAGE',
  '/purchase-requisition/approve': 'PR_APPROVE',
  '/purchase-requisition/status': 'PR_STATUS',
  '/purchase-requisition/preview': 'PR_PREVIEW',
  '/purchase-requisition/:id/edit': 'PR_MANAGE',
  '/rfp': 'RFP',
  '/rfp/create': 'RFP_CREATE',
  '/rfp/create-manual': 'RFP_CREATE_MANUAL',
  '/rfp/manage': 'RFP_MANAGE',
  '/rfp/preview': 'RFP_PREVIEW',
  '/rfp/submit-quotation': 'RFP_SUBMIT_QUOTATION',
  '/rfp/resubmit-quotation': 'RFP_RESUBMIT_QUOTATION',
  '/rfp/negotiate': 'RFP_NEGOTIATE',
  '/rfp/quotation-preview': 'RFP_QUOTATION_PREVIEW',
  '/rfp/send-for-approval': 'RFP_SEND_APPROVAL',
  '/rfp/approval': 'RFP_APPROVE',
  '/rfp/summary': 'RFP_SUMMARY',
  '/rfp/:id/float': 'RFP_FLOAT',
  '/rfp/:id/evaluate': 'RFP_EVALUATE',
  '/rfp/:id/finalize': 'RFP_SEND_APPROVAL',
  '/rfp/:id/preview/:quotationId': 'RFP_PREVIEW',
  '/rfp/:id/submit-quotation/:quotationId': 'RFP_SUBMIT_QUOTATION',
  '/rfp/:id/resubmit-quotation/:quotationId': 'RFP_RESUBMIT_QUOTATION',
  '/purchase-orders': 'PO',


  '/purchase-orders/approve': 'PO_APPROVE',
  '/purchase-orders/modify': 'PO_MODIFY',
  '/purchase-orders/print': 'PO_PRINT',
  '/purchase-orders/all': 'PO_ALL',
  '/purchase-orders/:id/edit': 'PO_MODIFY',
  '/purchase-orders/:id/print': 'PO_PRINT',
  '/grn': 'GRN',
  '/grn/create': 'GRN_CREATE',
  '/invoices': 'INVOICE',
  '/invoice': 'INVOICE',
  '/invoices/create': 'INVOICE_CREATE',
  '/invoice/entry': 'INVOICE_CREATE',
  '/invoice/list': 'INVOICE_MANAGE',
  '/master': 'MASTER',
  '/master/company': 'MASTER_COMPANY',
  '/master/currency': 'MASTER_CURRENCY',
  '/master/suppliers': 'MASTER_SUPPLIER',
  '/master/uom': 'MASTER_UOM',
  '/master/countries': 'MASTER_COUNTRY',
  '/master/states': 'MASTER_STATE',
  '/master/cities': 'MASTER_CITY',
  '/master/floors': 'MASTER_FLOOR',
  '/master/categories': 'MASTER_CATEGORY',
  '/master/subcategories': 'MASTER_SUBCATEGORY',
  '/master/items': 'MASTER_ITEM',
  '/master/designations': 'MASTER_DESIGNATION',
  '/master/departments': 'MASTER_DEPARTMENT',
  '/master/cost-centers': 'MASTER_COST_CENTER',
  '/master/employees': 'MASTER_EMPLOYEE',

  '/master/financial-year': 'MASTER_FINANCIAL_YEAR',
  '/master/budget': 'MASTER_BUDGET',
  '/master/building': 'MASTER_BUILDING',
  '/master/locations': 'MASTER_LOCATION',
  '/master/tax': 'MASTER_TAX',
  '/master/payment-terms': 'MASTER_PAYMENT_TERMS',
  '/master/terms-and-conditions': 'MASTER_TERMS_CONDITIONS',
  '/master/user-types': 'MASTER_USER_TYPE',
  '/master/user-permissions': 'MASTER_USER_PERMISSION',
  '/master/login-provision': 'MASTER_LOGIN_PROVISION',
  '/reports': 'REPORTS',
  '/settings': 'SETTINGS',
};

/**
 * Get module code for a route path
 * Supports both static routes and dynamic routes with parameters
 */
export const getModuleCode = (routePath: string): string | undefined => {
  // Normalize route path
  const normalizedPath =
    routePath.endsWith('/') && routePath !== '/'
      ? routePath.slice(0, -1)
      : routePath;

  // First try exact match
  const exactMatch = routeToModuleMap[normalizedPath];
  if (exactMatch) {
    return exactMatch;
  }

  // Handle dynamic routes
  for (const route in routeToModuleMap) {
    if (route.includes(':')) {
      const regex = createPathRegex(route);
      if (regex.test(normalizedPath)) {
        return routeToModuleMap[route];
      }
    }
  }

  return undefined;
};
