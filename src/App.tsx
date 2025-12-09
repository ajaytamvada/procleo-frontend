import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RootRedirect from '@/components/auth/RootRedirect';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';
import UnauthorizedPage from '@/pages/Unauthorized';
import Dashboard from '@/pages/Dashboard';
import PurchaseOrders from '@/pages/PurchaseOrders';
import Vendors from '@/pages/Vendors';
import CreateUser from '@/features/users/pages/CreateUser';
import UserManagement from '@/features/users/pages/UserManagement';
import ComponentShowcase from '@/pages/ComponentShowcase';
import CacheManagerDebug from '@/components/debug/CacheManager';
import { PurchaseOrderForm } from '@/pages/purchase-orders/PurchaseOrderForm';
import {
  CreatePRPage,
  ManagePRPage,
  ApprovePRPage,
  PRStatusPage,
  PRPreviewPage,
} from '@/features/purchase-requisition';
import VendorRegistrationPage from '@/pages/vendors/VendorRegistration';
import TestLayout from '@/pages/auth/TestLayout';
import TestLayout2 from '@/pages/auth/TestLayout2';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import {
  RFPActivityHub,
  RFPListPage,
  CreateRFPPage,
  FloatRFPPage,
  RFPPreviewListPage,
  RFPPreviewDetailPage,
  SubmitQuotationListPage,
  SubmitQuotationFormPage,
  ReSubmitQuotationListPage,
  ReSubmitQuotationFormPage,
  NegotiateQuotationListPage,
  QuotationComparisonPage,
  PreviewQuotationListPage,
  PreviewQuotationDetailPage,
  SendForApprovalListPage,
  SendForApprovalPage,
  ApprovalListPage,
  ApprovalDetailPage,
  RFPSummaryListPage,
  RFPSummaryDetailPage,
  FloatRFPListPage,
} from '@/features/rfp';
import { CreateRFPFromPRPage } from '@/features/rfp/pages/CreateRFPFromPRPage';
import PurchaseOrderListPage from '@/features/purchaseorder/pages/PurchaseOrderListPage';
import CreatePurchaseOrderPage from '@/features/purchaseorder/pages/CreatePurchaseOrderPage';
import PurchaseOrderDetailPage from '@/features/purchaseorder/pages/PurchaseOrderDetailPage';
import ApprovedRFPListPage from '@/features/purchaseorder/pages/ApprovedRFPListPage';
import POApprovalListPage from '@/features/purchaseorder/pages/POApprovalListPage';
import POApprovalDetailPage from '@/features/purchaseorder/pages/POApprovalDetailPage';
import DirectPOListPage from '@/features/purchaseorder/pages/DirectPOListPage';
import CreateDirectPOPage from '@/features/purchaseorder/pages/CreateDirectPOPage';
import ModifyPOListPage from '@/features/purchaseorder/pages/ModifyPOListPage';
import EditPOPage from '@/features/purchaseorder/pages/EditPOPage';
import PrintPOListPage from '@/features/purchaseorder/pages/PrintPOListPage';
import PrintPOPreviewPage from '@/features/purchaseorder/pages/PrintPOPreviewPage';
import AllPOPage from '@/features/purchaseorder/pages/AllPOPage';
import GRNListPage from '@/features/grn/pages/GRNListPage';
import CreateGRNPage from '@/features/grn/pages/CreateGRNPage';
import ModifyGRNPage from '@/features/grn/pages/ModifyGRNPage';
import GRNApprovalPage from '@/features/grn/pages/GRNApprovalPage';
import InvoiceListPage from '@/features/invoice/pages/InvoiceListPage';
import CreateInvoicePage from '@/features/invoice/pages/CreateInvoicePage';
import InvoiceEntryPage from '@/features/invoice/pages/InvoiceEntryPage';
import DirectInvoicePage from '@/features/invoice/pages/DirectInvoicePage';
import DownloadInvoicePage from '@/features/invoice/pages/DownloadInvoicePage';
// Import Report Pages
import PRReportPage from '@/features/reports/pages/PRReportPage';
import InvoiceReportPage from '@/features/reports/pages/InvoiceReportPage';
import ThreeWayMatchReportPage from '@/features/reports/pages/ThreeWayMatchReportPage';
import VendorReportPage from '@/features/reports/pages/VendorReportPage';
import POReportPage from '@/features/reports/pages/POReportPage';
import GRNReportPage from '@/features/reports/pages/GRNReportPage';
import FloatRFPReportPage from '@/features/reports/pages/FloatRFPReportPage';
import SubmittedRFPReportPage from '@/features/reports/pages/SubmittedRFPReportPage';
// Import Master Configuration Components
import {
  MasterDashboard,
  MasterConfigurationLayout,
  CompanyPage,
  DepartmentPage,
  CurrencyPage,
  SupplierPage,
  UOMPage,
  LocationPage,
  TaxPage,
  DesignationPage,
  CostCenterPage,
  BuildingPage,
  CountryPage,
  StatePage,
  CityPage,
  FloorPage,
  CategoryPage,
  SubCategoryPage,
  ItemPage,
  EmployeePage,
  AssignmentGroupPage,
} from '@/features/master';
import FinancialYearPage from '@/features/master/components/financialyear/FinancialYearPage';
import BudgetPage from '@/features/master/components/budget/BudgetPage';
import PaymentTermPage from '@/features/master/components/paymentterm/PaymentTermPage';
import TermsAndConditionsPage from '@/features/master/components/termsandconditions/TermsAndConditionsPage';
// Import Access Management Components
import UserTypePage from '@/features/access/components/usertype/UserTypePage';
import UserPermissionPage from '@/features/access/components/userpermission/UserPermissionPage';
import LoginProvisionPage from '@/features/access/components/loginprovision/LoginProvisionPage';
import '@/styles/globals.css';

// Placeholder components for remaining routes
import SettingsPage from '@/pages/SettingsPage';

const Documents: React.FC = () => (
  <div className='space-y-6'>
    <h1 className='text-2xl font-bold text-gray-900'>Document Management</h1>
    <div className='bg-white rounded-lg border border-gray-200 p-8 text-center'>
      <p className='text-gray-500'>Document management module coming soon...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme='light'>
        <BrowserRouter basename={import.meta.env.PROD ? '/AutoviticaP2P' : ''}>
          <ErrorBoundary level='page'>
            <Routes>
              {/* Root Redirect - handles / and redirects based on auth status */}
              <Route path='/' element={<RootRedirect />} />

              {/* Public Auth Routes */}
              <Route path='/auth' element={<AuthLayout />}>
                <Route path='login' element={<LoginPage />} />
                <Route path='register' element={<RegisterPage />} />
                <Route
                  path='forgot-password'
                  element={<ForgotPasswordPage />}
                />
              </Route>

              {/* Legacy auth routes for backward compatibility */}
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/forgot-password' element={<ForgotPasswordPage />} />
              <Route path='/unauthorized' element={<UnauthorizedPage />} />

              {/* Vendor Registration Route (Public) */}
              <Route
                path='/vendors/register'
                element={<VendorRegistrationPage />}
              />
              <Route
                path='/vendor-registration'
                element={<VendorRegistrationPage />}
              />

              {/* Test Layout Routes */}
              <Route path='/test-layout' element={<TestLayout />} />
              <Route path='/test-layout2' element={<TestLayout2 />} />

              {/* Protected Application Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path='dashboard' element={<Dashboard />} />

                {/* Purchase Requisition Routes */}
                <Route
                  path='purchase-requisition'
                  element={
                    <Navigate to='/purchase-requisition/create' replace />
                  }
                />
                <Route
                  path='purchase-requisition/create'
                  element={<CreatePRPage />}
                />
                <Route
                  path='purchase-requisition/manage'
                  element={<ManagePRPage />}
                />
                <Route
                  path='purchase-requisition/approve'
                  element={<ApprovePRPage />}
                />
                <Route
                  path='purchase-requisition/status'
                  element={<PRStatusPage />}
                />
                <Route
                  path='purchase-requisition/preview'
                  element={<PRPreviewPage />}
                />
                <Route
                  path='purchase-requisition/preview/:id'
                  element={<PRPreviewPage />}
                />

                {/* RFP Activity Routes */}
                <Route
                  path='rfp'
                  element={<Navigate to='/rfp/manage' replace />}
                />
                <Route
                  path='rfp/:id'
                  element={<RFPSummaryDetailPage />}
                />
                <Route
                  path='rfp/:id/edit'
                  element={<CreateRFPFromPRPage />}
                />
                <Route path='rfp/create' element={<CreateRFPFromPRPage />} />
                <Route path='rfp/create-manual' element={<CreateRFPPage />} />
                <Route path='rfp/float' element={<FloatRFPListPage />} />
                <Route path='rfp/:id/float' element={<FloatRFPPage />} />
                <Route path='rfp/manage' element={<RFPListPage />} />
                <Route path='rfp/preview' element={<RFPPreviewListPage />} />
                <Route
                  path='rfp/:rfpId/preview/:supplierId'
                  element={<RFPPreviewDetailPage />}
                />
                <Route
                  path='rfp/submit-quotation'
                  element={<SubmitQuotationListPage />}
                />
                <Route
                  path='rfp/:rfpId/submit-quotation/:supplierId'
                  element={<SubmitQuotationFormPage />}
                />
                <Route
                  path='rfp/resubmit-quotation'
                  element={<ReSubmitQuotationListPage />}
                />
                <Route
                  path='rfp/:rfpId/resubmit-quotation/:quotationId'
                  element={<ReSubmitQuotationFormPage />}
                />
                <Route
                  path='rfp/negotiate'
                  element={<NegotiateQuotationListPage />}
                />
                <Route
                  path='rfp/:rfpId/evaluate'
                  element={<QuotationComparisonPage />}
                />
                <Route
                  path='rfp/quotation-preview'
                  element={<PreviewQuotationListPage />}
                />
                <Route
                  path='rfp/quotation-preview/:quotationId'
                  element={<PreviewQuotationDetailPage />}
                />
                <Route
                  path='rfp/send-for-approval'
                  element={<SendForApprovalListPage />}
                />
                <Route
                  path='rfp/:rfpId/finalize'
                  element={<SendForApprovalPage />}
                />
                <Route path='rfp/approval' element={<ApprovalListPage />} />
                <Route
                  path='rfp/:rfpId/approve-reject'
                  element={<ApprovalDetailPage />}
                />
                <Route path='rfp/summary' element={<RFPSummaryListPage />} />
                <Route
                  path='rfp/:rfpId/summary'
                  element={<RFPSummaryDetailPage />}
                />
                <Route
                  path='rfp/responses'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>RFP Responses</h1>
                      <p className='text-gray-600'>
                        RFP Responses functionality coming soon...
                      </p>
                    </div>
                  }
                />
                <Route
                  path='rfp/analysis'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>
                        Comparative Analysis
                      </h1>
                      <p className='text-gray-600'>
                        Comparative Analysis functionality coming soon...
                      </p>
                    </div>
                  }
                />
                <Route
                  path='rfp/award'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>Award Contract</h1>
                      <p className='text-gray-600'>
                        Award Contract functionality coming soon...
                      </p>
                    </div>
                  }
                />
                <Route
                  path='rfp/reports'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>RFP Reports</h1>
                      <p className='text-gray-600'>
                        RFP Reports functionality coming soon...
                      </p>
                    </div>
                  }
                />
                <Route
                  path='rfp/settings'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>RFP Settings</h1>
                      <p className='text-gray-600'>
                        RFP Settings functionality coming soon...
                      </p>
                    </div>
                  }
                />
                <Route
                  path='rfp/templates'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>RFP Templates</h1>
                      <p className='text-gray-600'>
                        RFP Templates functionality coming soon...
                      </p>
                    </div>
                  }
                />
                <Route
                  path='rfp/archive'
                  element={
                    <div className='p-6'>
                      <h1 className='text-2xl font-bold'>RFP Archive</h1>
                      <p className='text-gray-600'>
                        RFP Archive functionality coming soon...
                      </p>
                    </div>
                  }
                />

                {/* Purchase Order Routes */}
                <Route
                  path='purchase-orders'
                  element={<PurchaseOrderListPage />}
                />
                <Route
                  path='purchase-orders/create'
                  element={<CreatePurchaseOrderPage />}
                />
                <Route
                  path='purchase-orders/create-from-rfp'
                  element={<ApprovedRFPListPage />}
                />
                <Route
                  path='purchase-orders/approve'
                  element={<POApprovalListPage />}
                />
                <Route
                  path='purchase-orders/approve/:id'
                  element={<POApprovalDetailPage />}
                />
                <Route
                  path='purchase-orders/direct'
                  element={<DirectPOListPage />}
                />
                <Route
                  path='purchase-orders/direct/create'
                  element={<CreateDirectPOPage />}
                />
                <Route
                  path='purchase-orders/modify'
                  element={<ModifyPOListPage />}
                />
                <Route
                  path='purchase-orders/print'
                  element={<PrintPOListPage />}
                />
                <Route
                  path='purchase-orders/print/:id'
                  element={<PrintPOPreviewPage />}
                />
                <Route path='purchase-orders/all' element={<AllPOPage />} />
                <Route
                  path='purchase-orders/:id'
                  element={<PurchaseOrderDetailPage />}
                />
                <Route
                  path='purchase-orders/:id/edit'
                  element={<EditPOPage />}
                />

                {/* GRN Routes */}
                <Route
                  path='grn'
                  element={<Navigate to='/grn/list' replace />}
                />
                <Route path='grn/create' element={<CreateGRNPage />} />
                <Route path='grn/modify' element={<ModifyGRNPage />} />
                <Route path='grn/approval' element={<GRNApprovalPage />} />
                <Route path='grn/list' element={<GRNListPage />} />
                <Route path='grn/:id' element={<GRNListPage />} />
                <Route path='grn/:id/edit' element={<CreateGRNPage />} />

                {/* Invoice Routes */}
                <Route
                  path='invoice'
                  element={<Navigate to='/invoice/list' replace />}
                />
                <Route path='invoice/list' element={<InvoiceListPage />} />
                <Route path='invoice/entry' element={<InvoiceEntryPage />} />
                <Route path='invoice/direct' element={<DirectInvoicePage />} />
                <Route
                  path='invoice/download'
                  element={<DownloadInvoicePage />}
                />
                <Route path='invoice/:id' element={<DownloadInvoicePage />} />

                {/* Legacy invoice routes for backward compatibility */}
                <Route
                  path='invoices'
                  element={<Navigate to='/invoice/list' replace />}
                />
                <Route
                  path='invoices/create'
                  element={<Navigate to='/invoice/entry' replace />}
                />
                <Route
                  path='invoices/:id'
                  element={<Navigate to='/invoice/list' replace />}
                />
                <Route
                  path='invoices/:id/edit'
                  element={<Navigate to='/invoice/entry' replace />}
                />

                {/* Master Configuration Routes */}
                <Route path='master'>
                  <Route index element={<MasterDashboard />} />
                  <Route path='company' element={<CompanyPage />} />
                  <Route path='departments' element={<DepartmentPage />} />
                  <Route path='suppliers' element={<SupplierPage />} />
                  <Route path='uom' element={<UOMPage />} />
                  <Route path='locations' element={<LocationPage />} />

                  {/* Placeholder routes for remaining forms */}
                  <Route path='currency' element={<CurrencyPage />} />
                  <Route path='tax' element={<TaxPage />} />
                  <Route path='building' element={<BuildingPage />} />
                  <Route
                    path='tags'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Tag Setup</h1>
                        <p className='text-gray-600'>
                          Tag management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='stockrooms'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Stock Rooms</h1>
                        <p className='text-gray-600'>
                          Stock room management coming soon...
                        </p>
                      </div>
                    }
                  />

                  {/* Financial Setup Routes */}
                  <Route
                    path='financial-year'
                    element={<FinancialYearPage />}
                  />
                  <Route path='budget' element={<BudgetPage />} />
                  <Route path='payment-terms' element={<PaymentTermPage />} />
                  <Route
                    path='terms-and-conditions'
                    element={<TermsAndConditionsPage />}
                  />

                  {/* Organization Details Routes */}
                  <Route path='designations' element={<DesignationPage />} />
                  <Route path='cost-centers' element={<CostCenterPage />} />
                  <Route path='employees' element={<EmployeePage />} />
                  <Route path='groups' element={<AssignmentGroupPage />} />

                  {/* Geographical Area Routes */}
                  <Route path='countries' element={<CountryPage />} />
                  <Route path='states' element={<StatePage />} />
                  <Route path='cities' element={<CityPage />} />
                  <Route path='floors' element={<FloorPage />} />
                  <Route
                    path='divisions'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Division Master</h1>
                        <p className='text-gray-600'>
                          Division management coming soon...
                        </p>
                      </div>
                    }
                  />

                  {/* Items & Categories Routes */}
                  <Route path='categories' element={<CategoryPage />} />
                  <Route path='subcategories' element={<SubCategoryPage />} />
                  <Route path='items' element={<ItemPage />} />
                  <Route
                    path='business-units'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Business Units</h1>
                        <p className='text-gray-600'>
                          Business unit management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='asset-categories'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Asset Categories</h1>
                        <p className='text-gray-600'>
                          Asset category management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='product-categories'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>
                          Product Categories
                        </h1>
                        <p className='text-gray-600'>
                          Product category management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='service-categories'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>
                          Service Categories
                        </h1>
                        <p className='text-gray-600'>
                          Service category management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='expense-categories'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>
                          Expense Categories
                        </h1>
                        <p className='text-gray-600'>
                          Expense category management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='user-roles'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>User Roles</h1>
                        <p className='text-gray-600'>
                          User role management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='permissions'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Permissions</h1>
                        <p className='text-gray-600'>
                          Permission management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='approval-matrix'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Approval Matrix</h1>
                        <p className='text-gray-600'>
                          Approval matrix management coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='p2p-setup'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>P2P Setup</h1>
                        <p className='text-gray-600'>
                          P2P configuration coming soon...
                        </p>
                      </div>
                    }
                  />
                  <Route
                    path='knowledge-base'
                    element={
                      <div className='p-6'>
                        <h1 className='text-2xl font-bold'>Knowledge Base</h1>
                        <p className='text-gray-600'>
                          Knowledge base management coming soon...
                        </p>
                      </div>
                    }
                  />

                  {/* Access Management Routes */}
                  <Route path='user-types' element={<UserTypePage />} />
                  <Route
                    path='user-permissions'
                    element={<UserPermissionPage />}
                  />
                  <Route
                    path='login-provision'
                    element={<LoginProvisionPage />}
                  />
                </Route>

                <Route path='purchases' element={<PurchaseOrders />} />
                <Route path='vendors' element={<Vendors />} />
                <Route path='users' element={<UserManagement />} />
                <Route path='users/create' element={<CreateUser />} />

                {/* Reports Routes */}
                <Route
                  path='reports'
                  element={<Navigate to='/reports/pr' replace />}
                />
                <Route path='reports/pr' element={<PRReportPage />} />
                <Route
                  path='reports/invoices'
                  element={<InvoiceReportPage />}
                />
                <Route
                  path='reports/three-way-match'
                  element={<ThreeWayMatchReportPage />}
                />
                <Route path='reports/vendor' element={<VendorReportPage />} />
                <Route path='reports/po' element={<POReportPage />} />
                <Route path='reports/grn' element={<GRNReportPage />} />
                <Route
                  path='reports/rfp-float'
                  element={<FloatRFPReportPage />}
                />
                <Route
                  path='reports/rfp-submitted'
                  element={<SubmittedRFPReportPage />}
                />

                <Route path='documents' element={<Documents />} />
                <Route path='settings' element={<SettingsPage />} />
                <Route path='components' element={<ComponentShowcase />} />
                <Route path='cache-debug' element={<CacheManagerDebug />} />

                {/* Test MasterDashboard in isolation */}
                <Route path='master-test' element={<MasterDashboard />} />

                {/* Purchase Order Routes */}
                <Route
                  path='purchases/new'
                  element={<PurchaseOrderForm mode='create' />}
                />
                <Route
                  path='purchases/:id/edit'
                  element={<PurchaseOrderForm mode='edit' />}
                />
                {/* TODO: Add PurchaseOrderDetail component */}

                {/* TODO: Add VendorDetail component */}
              </Route>

              {/* Fallback route */}
              <Route path='*' element={<Navigate to='/login' replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;
