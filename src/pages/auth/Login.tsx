import React from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Store } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import CompanyInfoSidebar from '@/components/auth/CompanyInfoSidebarNew';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get('portal');
  const isSupplier = portal === 'supplier';
  const isBuyer = portal === 'buyer';
  const showPortalContext = isSupplier || isBuyer;

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <div className='min-h-screen w-full flex flex-row bg-white'>
      {/* LEFT SECTION - Login Form Area */}
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
          {/* <p className='text-sm font-medium text-gray-600'>
            Don't have an account?{' '}
            <a
              href='/register'
              className='text-indigo-600 font-semibold hover:underline'
            >
              Sign Up
            </a>
          </p> */}
        </header>

        {/* Main Content */}
        <main className='flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 py-6'>
          <div className='w-full max-w-[340px]'>
            {showPortalContext && (
              <div className='mb-6'>
                <Link
                  to='/portal'
                  className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors mb-4'
                >
                  <ArrowLeft size={15} />
                  Change portal
                </Link>
                <div className='flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-md bg-[rgb(103,62,230)]/10 text-[rgb(103,62,230)]'>
                    {isSupplier ? (
                      <Store size={16} />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                  </span>
                  <div className='leading-tight'>
                    <p className='text-[11px] uppercase tracking-wide text-gray-400 font-semibold'>
                      Signing in to
                    </p>
                    <p className='text-sm font-semibold text-gray-800'>
                      {isSupplier ? 'Supplier Portal' : 'Buyer Portal'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <h1 className='text-3xl font-semibold text-gray-800 text-center mb-8'>
              Login
            </h1>
            <LoginForm />
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
      <CompanyInfoSidebar variant='login' />
    </div>
  );
}

export default LoginPage;
