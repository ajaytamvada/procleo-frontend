import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';
import CompanyInfoSidebar from '@/components/auth/CompanyInfoSidebarNew';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <div className='min-h-screen w-full flex flex-row bg-white'>
      {/* LEFT SECTION - Register Form Area */}
      <div className='w-full lg:flex-1 min-h-screen flex flex-col'>
        {/* Header */}
        <header className='flex items-center justify-between px-6 sm:px-10 lg:px-12 py-5'>
          <a href='/' className='flex items-center'>
            <img
              src={import.meta.env.BASE_URL + 'riditstack-logo-c.png'}
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
        <main className='flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 py-6'>
          <div className='w-full max-w-[340px]'>
            <h1 className='text-3xl font-semibold text-gray-800 text-center mb-8'>
              Sign Up
            </h1>
            <RegisterForm />
          </div>
        </main>

        {/* Footer */}
        {/* <footer className='px-6 sm:px-10 lg:px-12 py-4'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium'>
            <p>© 2024 ProcLeo by RiditStack Pvt Ltd. All rights reserved.</p>
            <nav className='flex items-center gap-5'>
              <a
                href='/support'
                className='hover:text-indigo-600 transition-colors'
              >
                Support
              </a>
              <a
                href='/privacy'
                className='hover:text-indigo-600 transition-colors'
              >
                Privacy
              </a>
              <a
                href='/terms'
                className='hover:text-indigo-600 transition-colors'
              >
                Terms
              </a>
            </nav>
          </div>
        </footer> */}
      </div>

      {/* RIGHT SECTION - Sidebar */}
      <CompanyInfoSidebar variant='register' />
    </div>
  );
}

export default RegisterPage;
