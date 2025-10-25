import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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
  PRPreviewPage 
} from '@/features/purchase-requisition';
import VendorRegistrationPage from '@/pages/vendors/VendorRegistration';
import TestLayout from '@/pages/auth/TestLayout';
import TestLayout2 from '@/pages/auth/TestLayout2';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { RFPListPage, CreateRFPPage } from '@/features/rfp';
import PurchaseOrderListPage from '@/features/purchaseorder/pages/PurchaseOrderListPage';
import CreatePurchaseOrderPage from '@/features/purchaseorder/pages/CreatePurchaseOrderPage';
import PurchaseOrderDetailPage from '@/features/purchaseorder/pages/PurchaseOrderDetailPage';
import GRNListPage from '@/features/grn/pages/GRNListPage';
import CreateGRNPage from '@/features/grn/pages/CreateGRNPage';
import InvoiceListPage from '@/features/invoice/pages/InvoiceListPage';
import CreateInvoicePage from '@/features/invoice/pages/CreateInvoicePage';
import '@/styles/globals.css';

// Placeholder components for remaining routes
const Reports: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <p className="text-gray-500">Reports module coming soon...</p>
    </div>
  </div>
);

const Documents: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <p className="text-gray-500">Document management module coming soon...</p>
    </div>
  </div>
);

const Settings: React.FC = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <p className="text-gray-500">Settings module coming soon...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system">
        <BrowserRouter>
          <ErrorBoundary level="page">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
              </Route>
              
              {/* Legacy auth routes for backward compatibility */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Vendor Registration Route (Public) */}
              <Route path="/vendors/register" element={<VendorRegistrationPage />} />
              <Route path="/vendor-registration" element={<VendorRegistrationPage />} />
              
              {/* Test Layout Routes */}
              <Route path="/test-layout" element={<TestLayout />} />
              <Route path="/test-layout2" element={<TestLayout2 />} />
              
              {/* Protected Application Routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Purchase Requisition Routes */}
                <Route path="purchase-requisition/create" element={<CreatePRPage />} />
                <Route path="purchase-requisition/manage" element={<ManagePRPage />} />
                <Route path="purchase-requisition/approve" element={<ApprovePRPage />} />
                <Route path="purchase-requisition/status" element={<PRStatusPage />} />
                <Route path="purchase-requisition/preview" element={<PRPreviewPage />} />
                <Route path="purchase-requisition/preview/:id" element={<PRPreviewPage />} />
                
                {/* RFP Routes */}
                <Route path="rfp" element={<RFPListPage />} />
                <Route path="rfp/create" element={<CreateRFPPage />} />
                
                {/* Purchase Order Routes */}
                <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
                <Route path="purchase-orders/create" element={<CreatePurchaseOrderPage />} />
                <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                <Route path="purchase-orders/:id/edit" element={<CreatePurchaseOrderPage />} />
                
                {/* GRN Routes */}
                <Route path="grn" element={<GRNListPage />} />
                <Route path="grn/create" element={<CreateGRNPage />} />
                <Route path="grn/:id" element={<GRNListPage />} />
                <Route path="grn/:id/edit" element={<CreateGRNPage />} />
                
                {/* Invoice Routes */}
                <Route path="invoices" element={<InvoiceListPage />} />
                <Route path="invoices/create" element={<CreateInvoicePage />} />
                <Route path="invoices/:id" element={<InvoiceListPage />} />
                <Route path="invoices/:id/edit" element={<CreateInvoicePage />} />
                
                <Route path="purchases" element={<PurchaseOrders />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/create" element={<CreateUser />} />
                <Route path="reports" element={<Reports />} />
                <Route path="documents" element={<Documents />} />
                <Route path="settings" element={<Settings />} />
                <Route path="components" element={<ComponentShowcase />} />
                <Route path="cache-debug" element={<CacheManagerDebug />} />
                
                {/* Purchase Order Routes */}
                <Route path="purchases/new" element={<PurchaseOrderForm mode="create" />} />
                <Route path="purchases/:id/edit" element={<PurchaseOrderForm mode="edit" />} />
                {/* TODO: Add PurchaseOrderDetail component */}
                
                {/* TODO: Add VendorDetail component */}
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;