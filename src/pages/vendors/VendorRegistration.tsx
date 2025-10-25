import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VendorRegistrationForm from '@/components/vendors/VendorRegistrationForm';
import CompanyInfoSidebar from '@/components/auth/CompanyInfoSidebarNew';

export function VendorRegistrationPage() {
  return (
    <div className="min-h-screen w-full flex flex-row">
      {/* Vendor Registration Form Section - Left Half */}
      <div className="w-full lg:w-1/2 min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="w-full bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="flex items-center justify-between py-4">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Already registered?</span>
                <Link
                  to="/login"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#6366f1' }}
                >
                  Vendor Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full" style={{ maxWidth: '800px' }}>
            <VendorRegistrationForm />
          </div>
        </div>

        {/* Footer */}
        <div className="w-full py-8 px-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
          <p className="mb-4 text-gray-600">
            Need help with registration? Contact our vendor support team
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a href="mailto:vendor-support@riditstack.com" className="hover:underline" style={{ color: '#6366f1' }}>
              vendor-support@riditstack.com
            </a>
            <span className="text-gray-400">|</span>
            <a href="tel:+91-9876543210" className="hover:underline" style={{ color: '#6366f1' }}>
              +91 98765 43210
            </a>
          </div>
          <div className="mt-6">
            <p>© 2024 Autovitica by RiditStack Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      {/* Company Info Sidebar - Right Half */}
      <CompanyInfoSidebar variant="vendor" />
    </div>
  );
}

export default VendorRegistrationPage;