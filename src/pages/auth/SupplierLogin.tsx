import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Store,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Mail,
  ChevronDown,
} from 'lucide-react';
import {
  GlassPurchaseOrder,
  GlassShipment,
  GlassAnalytics,
  GlassContract,
  GlassFloatStyles,
} from '@/components/glass-objects';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations';

// Supplier signature colour — the cyan/blue storefront accent from the
// portal-select page. Differentiates supplier sign-in from the buyer's violet.
const SUPPLIER_TILE = 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)';

// Country codes (mirrors the phone flow on the shared LoginForm).
const countryCodes = [
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+971', country: 'AE', name: 'UAE' },
  { code: '+65', country: 'SG', name: 'Singapore' },
];

const phoneLoginSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(10, 'Enter a valid phone number'),
});
type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter 6-digit OTP'),
});
type OTPFormData = z.infer<typeof otpSchema>;

// The four floating glass objects arranged AROUND the centred card. Positions
// are anchored to the viewport centre (calc(50% ± px)) rather than the edges,
// so the collage keeps a fixed spread from the card and never drifts on ultra-
// wide (≥1600px) screens. The Purchase Order (upper-left) deliberately tucks
// its lower-right corner UNDER the card's left edge so the card's backdrop-blur
// visibly frosts it — that overlap is what sells the glass.
const COLLAGE: {
  key: string;
  Component: React.ComponentType;
  style: React.CSSProperties; // position anchored to centre
  rot: number;
  scale: number;
  opacity: number;
  dur: string;
  delay: string;
}[] = [
  {
    key: 'po',
    Component: GlassPurchaseOrder,
    style: { top: '15%', left: 'calc(50% - 330px)' },
    rot: -10,
    scale: 1.05,
    opacity: 0.95,
    dur: '17s',
    delay: '0s',
  },
  {
    key: 'shipment',
    Component: GlassShipment,
    style: { top: '14%', right: 'calc(50% - 360px)' },
    rot: 8,
    scale: 1.0,
    opacity: 0.9,
    dur: '15s',
    delay: '2.5s',
  },
  {
    key: 'contract',
    Component: GlassContract,
    style: { bottom: '9%', left: 'calc(50% - 400px)' },
    rot: 8,
    scale: 0.9,
    opacity: 0.8,
    dur: '20s',
    delay: '3.4s',
  },
  {
    key: 'analytics',
    Component: GlassAnalytics,
    style: { bottom: '8%', right: 'calc(50% - 400px)' },
    rot: -7,
    scale: 0.9,
    opacity: 0.8,
    dur: '19s',
    delay: '1.2s',
  },
];

type Mode = 'email' | 'phone' | 'otp';

export function SupplierLogin() {
  const [mode, setMode] = useState<Mode>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneData, setPhoneData] = useState({
    countryCode: '+91',
    phoneNumber: '',
  });
  const [resendTimer, setResendTimer] = useState(0);

  const loginMutation = useLogin();

  // Email login — real auth via useLogin (which handles the post-login redirect).
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onTouched', // errors only after a field is blurred-invalid or on submit
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  // Phone / OTP forms (mirrors the demo-stubbed flow on the shared LoginForm).
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
    setValue: setPhoneValue,
    watch: watchPhone,
  } = useForm<PhoneLoginFormData>({
    mode: 'onTouched',
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { countryCode: '+91', phoneNumber: '' },
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setError: setOtpError,
  } = useForm<OTPFormData>({
    mode: 'onTouched',
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const selectedCountryCode = watchPhone('countryCode');
  const isLoading = isEmailSubmitting || loginMutation.isPending;

  const onEmailSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      // useLogin() performs the redirect on success.
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 401) {
        setServerError('Invalid login name or password. Please try again.');
      } else if (apiError.status === 429) {
        setServerError('Too many login attempts. Please try again later.');
      } else {
        setServerError(apiError.message || 'Login failed. Please try again.');
      }
    }
  };

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

  const onPhoneSubmit = (data: PhoneLoginFormData) => {
    // TODO: call API to send OTP (demo-stubbed, matching the shared LoginForm).
    setPhoneData(data);
    setMode('otp');
    startResendTimer();
  };

  const onOtpSubmit = () => {
    // TODO: call API to verify OTP + login (demo-stubbed).
    setOtpError('otp', {
      type: 'manual',
      message: 'OTP login is not yet enabled — please sign in with email.',
    });
  };

  const handleResendOTP = () => {
    if (resendTimer === 0) startResendTimer();
  };

  return (
    <div
      className='relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-5 py-10'
      style={{
        // Same deep-violet gradient family as the portal-select page.
        background:
          'linear-gradient(160deg, #2d1b69 0%, #1a0d3d 55%, #0f0620 100%)',
      }}
    >
      {/* Soft glow orbs for light */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='sup-orb sup-orb-1' />
        <div className='sup-orb sup-orb-2' />
      </div>

      {/* Glass procurement collage arranged around the card (z below the card) */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {COLLAGE.map(o => {
          const Obj = o.Component;
          return (
            <div
              key={o.key}
              className='glass-object absolute'
              style={
                {
                  ...o.style,
                  opacity: o.opacity,
                  '--dur': o.dur,
                  '--delay': o.delay,
                } as React.CSSProperties
              }
            >
              <div
                className='glass-inner'
                style={{ transform: `rotate(${o.rot}deg) scale(${o.scale})` }}
              >
                <Obj />
              </div>
            </div>
          );
        })}
      </div>

      {/* Centred frosted-glass login card */}
      <div className='sup-card relative z-20 w-full max-w-[420px]'>
        {/* 1. Change portal */}
        <Link
          to='/portal'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded'
        >
          <ArrowLeft size={15} />
          Change portal
        </Link>

        {/* 2. Portal identity row */}
        <div className='mt-6 flex items-center gap-3'>
          <span
            className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-lg'
            style={{ background: SUPPLIER_TILE }}
          >
            <Store className='h-5 w-5 text-white' />
          </span>
          <div className='leading-tight'>
            <p className='text-[11px] uppercase tracking-wider font-semibold text-white/50'>
              Signing in to
            </p>
            <p className='text-[18px] font-bold text-white'>Supplier Portal</p>
          </div>
        </div>

        {/* Server auth failure banner */}
        {serverError && (
          <div
            role='alert'
            className='mt-5 rounded-lg px-3.5 py-2.5 text-[13px]'
            style={{
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(248,113,113,0.35)',
              color: '#FECACA',
            }}
          >
            {serverError}
          </div>
        )}

        {/* ---------------- EMAIL (default) ---------------- */}
        {mode === 'email' && (
          <form
            onSubmit={handleEmailSubmit(onEmailSubmit)}
            className='mt-6 space-y-4'
            noValidate
          >
            <div>
              <label htmlFor='username' className='sup-label'>
                Registered Email Address
              </label>
              <input
                id='username'
                type='email'
                autoComplete='username'
                placeholder='you@company.com'
                disabled={isLoading}
                className={`sup-field ${emailErrors.username ? 'sup-error' : ''}`}
                {...registerEmail('username')}
              />
              {emailErrors.username && (
                <p className='sup-field-error'>
                  {emailErrors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor='password' className='sup-label'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  placeholder='Enter your password'
                  disabled={isLoading}
                  style={{ paddingRight: 44 }}
                  className={`sup-field ${emailErrors.password ? 'sup-error' : ''}`}
                  {...registerEmail('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(v => !v)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
              {emailErrors.password && (
                <p className='sup-field-error'>
                  {emailErrors.password.message}
                </p>
              )}
              {/* 5. Forgot password */}
              <div className='mt-2'>
                <Link
                  to='/forgot-password'
                  className='text-[13px] font-medium text-[#7DD3FC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded'
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* 6. Primary */}
            <button type='submit' disabled={isLoading} className='sup-primary'>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Signing in…
                </>
              ) : (
                'Log In'
              )}
            </button>

            {/* 7. Divider + glass-outline secondary */}
            <div className='sup-divider'>
              <span>or</span>
            </div>
            <button
              type='button'
              onClick={() => setMode('phone')}
              className='sup-outline'
            >
              <Phone className='h-4 w-4' />
              Continue with Phone Number
            </button>
          </form>
        )}

        {/* ---------------- PHONE ---------------- */}
        {mode === 'phone' && (
          <form
            onSubmit={handlePhoneSubmit(onPhoneSubmit)}
            className='mt-6 space-y-4'
            noValidate
          >
            <div>
              <label htmlFor='phoneNumber' className='sup-label'>
                Phone Number
              </label>
              <div className='flex gap-2'>
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setShowCountryDropdown(v => !v)}
                    className='sup-field flex items-center gap-1.5'
                    style={{ width: 96 }}
                  >
                    <span>{selectedCountryCode}</span>
                    <ChevronDown size={14} className='text-white/40' />
                  </button>
                  {showCountryDropdown && (
                    <div className='absolute z-50 top-full left-0 mt-1 w-56 rounded-lg border border-white/15 bg-[#1b1140] shadow-xl max-h-60 overflow-y-auto'>
                      {countryCodes.map(c => (
                        <button
                          key={c.code}
                          type='button'
                          onClick={() => {
                            setPhoneValue('countryCode', c.code);
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between hover:bg-white/5 ${
                            selectedCountryCode === c.code
                              ? 'text-sky-300'
                              : 'text-white/80'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className='font-medium'>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  id='phoneNumber'
                  type='tel'
                  inputMode='numeric'
                  placeholder='Enter phone number'
                  className={`sup-field flex-1 ${phoneErrors.phoneNumber ? 'sup-error' : ''}`}
                  {...registerPhone('phoneNumber')}
                />
              </div>
              {phoneErrors.phoneNumber && (
                <p className='sup-field-error'>
                  {phoneErrors.phoneNumber.message}
                </p>
              )}
            </div>

            <button type='submit' className='sup-primary'>
              Send OTP
            </button>

            <div className='sup-divider'>
              <span>or</span>
            </div>
            <button
              type='button'
              onClick={() => setMode('email')}
              className='sup-outline'
            >
              <Mail className='h-4 w-4' />
              Continue with Email
            </button>
          </form>
        )}

        {/* ---------------- OTP ---------------- */}
        {mode === 'otp' && (
          <form
            onSubmit={handleOtpSubmit(onOtpSubmit)}
            className='mt-6 space-y-4'
            noValidate
          >
            <button
              type='button'
              onClick={() => setMode('phone')}
              className='inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors'
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <p className='text-sm text-white/60'>
              Enter the 6-digit code sent to{' '}
              <span className='font-medium text-white/85'>
                {phoneData.countryCode} {phoneData.phoneNumber}
              </span>
            </p>
            <div>
              <label htmlFor='otp' className='sup-label'>
                One-Time Password
              </label>
              <input
                id='otp'
                type='text'
                inputMode='numeric'
                maxLength={6}
                placeholder='••••••'
                className={`sup-field text-center tracking-[0.5em] ${otpErrors.otp ? 'sup-error' : ''}`}
                {...registerOtp('otp')}
              />
              {otpErrors.otp && (
                <p className='sup-field-error'>{otpErrors.otp.message}</p>
              )}
            </div>
            <div className='text-center text-[13px] text-white/50'>
              {resendTimer > 0 ? (
                <>
                  Resend code in{' '}
                  <span className='text-sky-300 font-medium'>
                    {resendTimer}s
                  </span>
                </>
              ) : (
                <button
                  type='button'
                  onClick={handleResendOTP}
                  className='text-sky-300 font-medium hover:underline'
                >
                  Resend code
                </button>
              )}
            </div>
            <button type='submit' className='sup-primary'>
              Verify &amp; Sign In
            </button>
          </form>
        )}

        {/* 8. Footer inside card — vendor registration */}
        <p className='mt-6 text-center text-[13px] text-white/50'>
          New to ProcLeo?{' '}
          <Link
            to='/vendors/register'
            className='font-medium text-[#7DD3FC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded'
          >
            Create your vendor account
          </Link>
        </p>
      </div>

      {/* 9. Copyright below the card, on the gradient */}
      <p className='relative z-20 mt-8 text-center text-[13px] text-white/40'>
        © {new Date().getFullYear()} ProcLeo by RiditStack Pvt Ltd.
      </p>

      {/* Shared float/hide/reduced-motion CSS for the glass objects */}
      <GlassFloatStyles />

      <style>{`
        /* Soft glow orbs */
        .sup-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
        }
        .sup-orb-1 {
          width: 30rem; height: 30rem;
          top: -6rem; left: -4rem;
          background: radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%);
        }
        .sup-orb-2 {
          width: 32rem; height: 32rem;
          bottom: -8rem; right: -6rem;
          background: radial-gradient(circle, rgba(139,92,246,0.40) 0%, transparent 70%);
        }

        /* Centred frosted-glass card — the backdrop-filter is the money effect:
           the collage objects behind it (the Purchase Order tucked under the
           left edge) visibly frost through the glass. */
        .sup-card {
          padding: 40px 36px;
          border-radius: 20px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.16);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          backdrop-filter: blur(24px) saturate(140%);
          box-shadow:
            inset 0 1px 0 0 rgba(255,255,255,0.25),
            0 24px 64px rgba(0,0,0,0.45);
          animation: supCardIn 0.5s ease-out both;
        }
        /* Where backdrop-filter is unsupported, fall back to an opaque tint so
           the content stays readable over the collage. */
        @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
          .sup-card { background: rgba(20,16,50,0.85); }
        }
        @keyframes supCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sup-card { animation: none; }
        }

        /* Labels */
        .sup-label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
        }

        /* Dark glass inputs */
        .sup-field {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .sup-field::placeholder { color: rgba(255,255,255,0.35); }
        .sup-field:focus {
          outline: none;
          border-color: rgba(56,189,248,0.8);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.18);
        }
        .sup-field:disabled { opacity: 0.6; cursor: not-allowed; }
        .sup-field.sup-error { border-color: rgba(248,113,113,0.7); }
        .sup-field.sup-error:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.18); }
        .sup-field-error {
          margin-top: 6px;
          font-size: 13px;
          color: #FCA5A5;
        }

        /* The app's globals.css force-lights every input with !important + an
           attribute selector; override it with a higher-specificity, scoped
           !important rule so the supplier inputs read as dark glass. */
        .sup-card input.sup-field,
        .sup-card input.sup-field:focus {
          background: rgba(255,255,255,0.06) !important;
          color: #fff !important;
          border-color: rgba(255,255,255,0.18) !important;
        }
        .sup-card input.sup-field::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        .sup-card input.sup-field:focus {
          border-color: rgba(56,189,248,0.8) !important;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.18) !important;
        }
        .sup-card input.sup-field.sup-error,
        .sup-card input.sup-field.sup-error:focus {
          border-color: rgba(248,113,113,0.7) !important;
        }
        .sup-card input.sup-field.sup-error:focus {
          box-shadow: 0 0 0 3px rgba(248,113,113,0.18) !important;
        }

        /* Primary — brand violet with a cyan-tinted hover glow */
        .sup-primary {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
          background: rgb(103,62,230);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.15s ease, box-shadow 0.2s ease;
        }
        .sup-primary:hover:not(:disabled) {
          background: rgb(90,52,215);
          box-shadow: 0 8px 26px -8px rgba(56,189,248,0.5);
        }
        .sup-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .sup-primary:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.4);
        }

        /* Glass-outline secondary */
        .sup-outline {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .sup-outline:hover { background: rgba(255,255,255,0.06); }
        .sup-outline:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.4);
        }

        /* Divider with centred "or" — a rule segment on each side (no line
           crossing the text, which the translucent card can't mask). */
        .sup-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .sup-divider::before,
        .sup-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }
        .sup-divider span {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
        }

        /* Card goes full-width (minus margins) below 900px; collage already
           hides < 900px via GlassFloatStyles. */
        @media (max-width: 899px) {
          .sup-card { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}

export default SupplierLogin;
