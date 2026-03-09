import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Mail,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { z } from 'zod';

// Country codes data
const countryCodes = [
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+971', country: 'AE', name: 'UAE' },
  { code: '+65', country: 'SG', name: 'Singapore' },
];

// Phone login schema
const phoneLoginSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(10, 'Enter a valid phone number'),
});

type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;

// OTP schema
const otpSchema = z.object({
  otp: z.string().length(6, 'Enter 6-digit OTP'),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

type LoginMode = 'email' | 'phone' | 'otp';

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('email');
  const [phoneData, setPhoneData] = useState({
    countryCode: '+91',
    phoneNumber: '',
  });
  const [resendTimer, setResendTimer] = useState(0);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const loginMutation = useLogin();

  // Email login form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
    setError: setEmailError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Phone login form
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors, isSubmitting: isPhoneSubmitting },
    setValue: setPhoneValue,
    watch: watchPhone,
  } = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      countryCode: '+91',
      phoneNumber: '',
    },
  });

  // OTP form
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
    setError: setOtpError,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const selectedCountryCode = watchPhone('countryCode');

  // Email login submit
  const onEmailSubmit = async (data: LoginFormData) => {
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
        setEmailError('root', {
          type: 'manual',
          message: 'Invalid login name or password. Please try again.',
        });
      } else if (apiError.status === 429) {
        setEmailError('root', {
          type: 'manual',
          message: 'Too many login attempts. Please try again later.',
        });
      } else {
        setEmailError('root', {
          type: 'manual',
          message: apiError.message || 'Login failed. Please try again.',
        });
      }
    }
  };

  // Phone login submit - send OTP
  const onPhoneSubmit = async (data: PhoneLoginFormData) => {
    try {
      // TODO: Call API to send OTP
      // await sendOTP({ countryCode: data.countryCode, phoneNumber: data.phoneNumber });

      setPhoneData({
        countryCode: data.countryCode,
        phoneNumber: data.phoneNumber,
      });
      setLoginMode('otp');
      startResendTimer();
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  // OTP verification submit
  const onOtpSubmit = async (data: OTPFormData) => {
    try {
      // TODO: Call API to verify OTP and login
      // await verifyOTP({ ...phoneData, otp: data.otp });

      // For demo, simulate successful login
      onSuccess?.();
    } catch (error: unknown) {
      setOtpError('otp', {
        type: 'manual',
        message: 'Invalid OTP. Please try again.',
      });
    }
  };

  // Resend OTP timer
  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendTimer === 0) {
      // TODO: Call API to resend OTP
      startResendTimer();
    }
  };

  const handleBackToPhone = () => {
    setLoginMode('phone');
  };

  const handleBackToEmail = () => {
    setLoginMode('email');
  };

  const isLoading =
    isEmailSubmitting ||
    isPhoneSubmitting ||
    isOtpSubmitting ||
    loginMutation.isPending;

  if (loginMode === 'otp') {
    return (
      <div className={`w-full ${className}`}>
        {/* Back Button */}
        <button
          type='button'
          onClick={handleBackToPhone}
          className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors'
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* OTP Header */}
        <div className='text-center mb-6'>
          <div className='w-14 h-14 bg-[rgb(103,62,230)]/10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Phone className='w-6 h-6 text-[rgb(103,62,230)]' />
          </div>
          <h2 className='text-lg font-semibold text-gray-900 mb-1'>
            Verify your phone number
          </h2>
          <p className='text-sm text-gray-500'>
            We've sent a 6-digit OTP to{' '}
            <span className='font-medium text-gray-700'>
              {phoneData.countryCode} {phoneData.phoneNumber}
            </span>
          </p>
        </div>

        <form onSubmit={handleOtpSubmit(onOtpSubmit)} className='space-y-4'>
          {/* OTP Input */}
          <div>
            <label
              htmlFor='otp'
              className='block text-[13px] font-medium text-gray-600 mb-1.5'
            >
              Enter OTP
            </label>
            <Input
              id='otp'
              type='text'
              inputMode='numeric'
              maxLength={6}
              placeholder='Enter 6-digit OTP'
              className='w-full h-12 px-4 text-center text-lg tracking-[0.5em] font-semibold border border-gray-300 rounded-md focus:border-[rgb(103,62,230)] focus:ring-2 focus:ring-[rgb(103,62,230)]/20 transition-all placeholder:text-gray-400 placeholder:tracking-normal placeholder:text-sm placeholder:font-normal'
              error={otpErrors.otp?.message}
              disabled={isLoading}
              {...registerOtp('otp')}
            />
          </div>

          {/* Resend OTP */}
          <div className='text-center'>
            {resendTimer > 0 ? (
              <p className='text-sm text-gray-500'>
                Resend OTP in{' '}
                <span className='font-medium text-[rgb(103,62,230)]'>
                  {resendTimer}s
                </span>
              </p>
            ) : (
              <button
                type='button'
                onClick={handleResendOTP}
                className='text-sm font-medium text-[rgb(103,62,230)] hover:text-[rgb(83,42,210)] hover:underline'
              >
                Resend OTP
              </button>
            )}
          </div>

          {/* Error Alert */}
          {otpErrors.otp && (
            <Alert variant='destructive' className='text-sm py-2'>
              {otpErrors.otp.message}
            </Alert>
          )}

          {/* Verify Button */}
          <Button
            type='submit'
            className='w-full h-11 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] text-white text-sm font-semibold rounded-md shadow-sm hover:shadow transition-all'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify & Login'
            )}
          </Button>
        </form>

        {/* Change Number */}
        <div className='mt-4 text-center'>
          <button
            type='button'
            onClick={handleBackToPhone}
            className='text-sm text-gray-500 hover:text-gray-700'
          >
            Wrong number?{' '}
            <span className='font-medium text-[rgb(103,62,230)]'>Change</span>
          </button>
        </div>
      </div>
    );
  }

  if (loginMode === 'phone') {
    return (
      <div className={`w-full ${className}`}>
        <form onSubmit={handlePhoneSubmit(onPhoneSubmit)} className='space-y-4'>
          <div>
            <label
              htmlFor='phoneNumber'
              className='block text-[13px] font-medium text-gray-600 mb-1.5'
            >
              Phone Number
            </label>
            <div className='flex flex-1 gap-2'>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className='h-11 px-3 flex items-center gap-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:border-[rgb(103,62,230)] focus:ring-2 focus:ring-[rgb(103,62,230)]/20 transition-all min-w-[90px]'
                >
                  <span className='text-sm font-medium text-gray-700'>
                    {selectedCountryCode}
                  </span>
                  <ChevronDown size={14} className='text-gray-400' />
                </button>

                {/* Dropdown Menu */}
                {showCountryDropdown && (
                  <div className='absolute z-50 top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                    {countryCodes.map(country => (
                      <button
                        key={country.code}
                        type='button'
                        onClick={() => {
                          setPhoneValue('countryCode', country.code);
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                          selectedCountryCode === country.code
                            ? 'bg-[rgb(103,62,230)]/5 text-[rgb(103,62,230)]'
                            : 'text-gray-700'
                        }`}
                      >
                        <span>{country.name}</span>
                        <span className='font-medium'>{country.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Input
                id='phoneNumber'
                type='tel'
                inputMode='numeric'
                placeholder='Enter phone number'
                className='flex-1 h-11 px-3.5 w-100 text-sm border border-gray-300 rounded-md focus:border-[rgb(103,62,230)] focus:ring-2 focus:ring-[rgb(103,62,230)]/20 transition-all placeholder:text-gray-400'
                error={phoneErrors.phoneNumber?.message}
                disabled={isLoading}
                {...registerPhone('phoneNumber')}
              />
            </div>
            {phoneErrors.phoneNumber && (
              <p className='mt-1.5 text-sm text-red-500'>
                {phoneErrors.phoneNumber.message}
              </p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full h-11 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] text-white text-sm font-semibold rounded-md shadow-sm hover:shadow transition-all'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className='relative my-5'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-200' />
          </div>
          <div className='relative flex justify-center text-xs'>
            <span className='px-3 bg-white text-gray-400'>or</span>
          </div>
        </div>

        <button
          type='button'
          onClick={handleBackToEmail}
          className='w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all'
        >
          <Mail className='w-4 h-4' />
          <span>Continue with Email</span>
        </button>

        <div className='mt-5 pt-5 border-t border-gray-100'>
          <p className='text-center text-[13px] text-gray-500 font-medium'>
            Are you a vendor?{' '}
            <Link
              to='/vendors/register'
              className='font-medium text-[rgb(103,62,230)] hover:text-[rgb(83,42,210)] hover:underline'
            >
              Register as Vendor
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // EMAIL LOGIN VIEW (Default)
  // =====================================================
  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleEmailSubmit(onEmailSubmit)} className='space-y-4'>
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
            className='w-full h-11 px-3.5 text-sm border border-gray-300 rounded-md focus:border-[rgb(103,62,230)] focus:ring-2 focus:ring-[rgb(103,62,230)]/20 transition-all placeholder:text-gray-400'
            error={emailErrors.username?.message}
            disabled={isLoading}
            {...registerEmail('username')}
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
              className='w-full h-11 px-3.5 pr-10 text-sm border border-gray-300 rounded-md focus:border-[rgb(103,62,230)] focus:ring-2 focus:ring-[rgb(103,62,230)]/20 transition-all placeholder:text-gray-400'
              error={emailErrors.password?.message}
              disabled={isLoading}
              {...registerEmail('password')}
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
              className='text-[13px] text-[rgb(103,62,230)] hover:text-[rgb(83,42,210)] font-medium hover:underline'
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {emailErrors.root && (
          <Alert variant='destructive' className='text-sm py-2'>
            {emailErrors.root.message}
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type='submit'
          className='w-full h-11 bg-[rgb(103,62,230)] hover:bg-[rgb(83,42,210)] text-white text-sm font-semibold rounded-md shadow-sm hover:shadow transition-all'
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

        {/* Continue with Phone Number */}
        <button
          type='button'
          onClick={() => setLoginMode('phone')}
          className='w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all'
        >
          <Phone className='w-4 h-4' />
          <span>Continue with Phone Number</span>
        </button>
      </form>

      {/* Vendor Registration Link */}
      <div className='mt-5 pt-5 border-t border-gray-100'>
        <p className='text-center text-[13px] text-gray-500 font-medium'>
          Are you a vendor?{' '}
          <Link
            to='/vendors/register'
            className='font-medium text-[rgb(103,62,230)] hover:text-[rgb(83,42,210)] hover:underline'
          >
            Register as Vendor
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
