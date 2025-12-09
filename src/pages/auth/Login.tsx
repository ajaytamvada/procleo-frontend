import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import CompanyInfoSidebar from '@/components/auth/CompanyInfoSidebarNew';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <div className='min-h-screen w-full flex flex-row'>
      {/* Login Form Section - Left Half */}
      <div className='w-full lg:w-1/2 min-h-screen bg-gray-50 flex flex-col'>
        {/* Main Content Area */}
        <div className='flex-1 w-full flex items-center justify-center p-4 sm:p-6 lg:p-8'>
          <div className='w-full' style={{ maxWidth: '480px' }}>
            {/* Header */}
            <div className='text-center mb-8'>
              <div className='mx-auto mb-6'>
                <img
                  src='/riditstack-logo.png'
                  alt='RiditStack Logo'
                  className='h-16 w-auto mx-auto'
                />
              </div>
              <h1
                className='text-3xl font-bold mb-2'
                style={{ color: '#1a0b2e' }}
              >
                Welcome Back
              </h1>
              <p className='text-gray-600'>Sign in to access ProcLeo P2P</p>
            </div>

            {/* Login Form */}
            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className='w-full py-8 px-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white'>
          <p>© 2024 ProcLeo by RiditStack Pvt Ltd. All rights reserved.</p>
          <div className='mt-2 space-x-4'>
            <a
              href='/support'
              className='hover:underline'
              style={{ color: '#6366f1' }}
            >
              Support
            </a>
            <a
              href='/privacy'
              className='hover:underline'
              style={{ color: '#6366f1' }}
            >
              Privacy
            </a>
            <a
              href='/terms'
              className='hover:underline'
              style={{ color: '#6366f1' }}
            >
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Company Info Sidebar - Right Half */}
      <CompanyInfoSidebar variant='login' />
    </div>
  );
}

export default LoginPage;
