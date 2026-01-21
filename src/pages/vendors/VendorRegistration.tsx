import React from 'react';
import VendorRegistrationForm from '@/components/vendors/VendorRegistrationForm';
import CompanyInfoSidebar from '@/components/auth/CompanyInfoSidebarNew';

export function VendorRegistrationPage() {
  return (
    <div className='min-h-screen w-full flex flex-row bg-white'>
      {/* LEFT SECTION - Vendor Registration Form Area */}
      <div className='w-full lg:flex-1 min-h-screen flex flex-col'>
        {/* Header */}
        <header className='flex items-center justify-between px-6 sm:px-10 lg:px-12 py-5'>
          <a href='/' className='flex items-center'>
            <img
              src='/riditstack-logo-c.png'
              alt='RiditStack Logo'
              className='h-9 w-auto'
            />
          </a>
          <p className='text-sm font-medium text-gray-600'>
            Already have an account?{' '}
            <a
              href='/login'
              className='text-indigo-600 font-semibold hover:underline'
            >
              Sign In
            </a>
          </p>
        </header>

        {/* Main Content */}
        <main className='flex-1 flex flex-col items-center justify-start px-6 sm:px-10 lg:px-12 py-6 overflow-y-auto'>
          <div className='w-full max-w-[800px]'>
            <h1 className='text-3xl font-semibold text-gray-800 text-center mb-8'>
              Vendor Registration
            </h1>
            <VendorRegistrationForm />
          </div>
        </main>
      </div>

      {/* RIGHT SECTION - Sidebar */}
      <CompanyInfoSidebar variant='vendor' />
    </div>
  );
}

export default VendorRegistrationPage;
