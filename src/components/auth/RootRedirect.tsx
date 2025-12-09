import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Root Redirect Component
 *
 * Handles the root path (/) by redirecting to either:
 * - /dashboard if user is authenticated
 * - /login if user is not authenticated
 */
const RootRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto'></div>
        <p className='mt-4 text-gray-600 font-medium'>Loading...</p>
      </div>
    </div>
  );
};

export default RootRedirect;
