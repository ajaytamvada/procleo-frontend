import React from 'react';
import { Link } from 'react-router-dom';
import VendorRegistrationForm from '@/components/vendors/VendorRegistrationForm';
import CompanyInfoSidebar from '@/components/auth/CompanyInfoSidebarNew';

export function VendorRegistrationPage() {
  return (
    <div className='min-h-screen w-full flex flex-row bg-white'>
      {/* LEFT SECTION - Registration Form Area */}
      <div className='w-full lg:flex-1 min-h-screen flex flex-col'>
        {/* Header */}
        <header className='flex items-center justify-between px-6 sm:px-10 lg:px-12 py-5'>
          <Link to='/' className='flex items-center'>
            <img
              src={import.meta.env.BASE_URL + 'riditstack-logo-c.png'}
              alt='RiditStack Logo'
              className='h-9 w-auto'
            />
          </Link>
          <p className='text-sm font-medium text-gray-600'>
            Already have an account?{' '}
            <Link
              to='/auth/login'
              className='text-indigo-600 font-semibold hover:underline'
            >
              Sign In
            </Link>
          </p>
        </header>

        {/* Main Content */}
        <main className='flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 py-8'>
          <div className='w-full max-w-[600px]'>
            <h1 className='text-3xl font-semibold text-gray-800 text-center mb-2'>
              Vendor Registration
            </h1>
            <p className='text-center text-gray-600 mb-8'>
              Join our platform as a trusted vendor
            </p>
            <VendorRegistrationForm />
          </div>
        </main>
      </div>

      {/* RIGHT SECTION - Sidebar */}
      <CompanyInfoSidebar variant='register' />
    </div>
  );
}

export default VendorRegistrationPage;
