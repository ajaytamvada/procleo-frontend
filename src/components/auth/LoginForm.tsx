import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      onSuccess?.();
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Invalid login name or password. Please try again.',
        });
      } else if (apiError.status === 429) {
        setError('root', {
          type: 'manual',
          message: 'Too many login attempts. Please try again later.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: apiError.message || 'Login failed. Please try again.',
        });
      }
    }
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Login Name Field */}
        <div>
          <label
            htmlFor='username'
            className='block text-[13px] font-medium text-gray-600 mb-1.5'
          >
            Registered Email Address
          </label>
          <Input
            id='username'
            type='text'
            autoComplete='username'
            className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
            error={errors.username?.message}
            disabled={isLoading}
            {...register('username')}
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor='password'
            className='block text-[13px] font-medium text-gray-600 mb-1.5'
          >
            Password
          </label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              className='w-full h-11 px-3.5 pr-10 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400'
              error={errors.password?.message}
              disabled={isLoading}
              {...register('password')}
            />
            <button
              type='button'
              className='absolute inset-y-0 right-0 pr-3 flex items-center'
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors' />
              ) : (
                <Eye className='h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors' />
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className='mt-1.5'>
            <Link
              to='/forgot-password'
              className='text-[13px] text-indigo-600 hover:text-indigo-700 font-medium hover:underline'
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {errors.root && (
          <Alert variant='destructive' className='text-sm py-2'>
            {errors.root.message}
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type='submit'
          className='w-full h-11 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm hover:shadow transition-all'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Signing In...
            </>
          ) : (
            'Log In'
          )}
        </Button>

        {/* Divider */}
        <div className='relative my-5'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-200' />
          </div>
          <div className='relative flex justify-center text-xs'>
            <span className='px-3 bg-white text-gray-400'>or</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type='button'
          className='w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 hover:border-gray-400 transition-all'
        >
          <svg className='w-4 h-4' viewBox='0 0 24 24'>
            <path
              fill='#4285F4'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='#34A853'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='#FBBC05'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
              fill='#EA4335'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
          </svg>
          <span className='font-medium text-gray-600'>Sign in with Google</span>
        </button>

        {/* reCAPTCHA Notice */}
        <p className='text-center text-[11px] text-gray-400 font-medium mt-3'>
          Protected by reCAPTCHA. Google{' '}
          <a href='#' className='text-indigo-500 hover:underline'>
            Privacy Policy
          </a>
          {' & '}
          <a href='#' className='text-indigo-500 hover:underline'>
            Terms of Service
          </a>
          {' apply.'}
        </p>
      </form>

      {/* Vendor Registration Link */}
      <div className='mt-5 pt-5 border-t border-gray-100'>
        <p className='text-center text-[13px] text-gray-500 font-medium'>
          Are you a vendor?{' '}
          <Link
            to='/vendors/register'
            className='font-medium text-indigo-600 hover:text-indigo-700 hover:underline'
          >
            Register as Vendor
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
