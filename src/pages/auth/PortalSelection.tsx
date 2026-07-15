import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Store,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  Package,
  ClipboardCheck,
  Receipt,
  Building2,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  GlassPurchaseOrder,
  GlassShipment,
  GlassAnalytics,
  GlassContract,
  GlassFloatStyles,
} from '@/components/glass-objects';

// Placement collage — outer thirds only, generous clear zone around the
// headline / subtitle / portal cards. `lower` objects are hidden < 1200px;
// everything is hidden < 900px (mobile gets the clean gradient only).
const GLASS_OBJECTS: {
  key: string;
  Component: React.ComponentType;
  className: string; // absolute positioning
  rot: number; // base rotation (deg)
  scale: number; // base scale
  opacity: number; // near/far depth
  dur: string; // float duration
  delay: string; // float delay
  lower?: boolean; // hidden < 1200px
}[] = [
  {
    key: 'po',
    Component: GlassPurchaseOrder,
    className: 'top-[12%] left-[-2%]',
    rot: -8,
    scale: 1.1,
    opacity: 0.9,
    dur: '17s',
    delay: '0s',
  },
  {
    // upper-right outer third, near layer: mirrors the Purchase Order's
    // upper-left position; bleeds slightly off the right edge (~75%+ visible).
    key: 'shipment',
    Component: GlassShipment,
    className: 'top-[12%] right-[-2%]',
    rot: 7,
    scale: 1.05,
    opacity: 0.9,
    dur: '15s',
    delay: '2.5s',
  },
  {
    // lower-right outer third, far layer: mirrors the Contract's lower-left
    // rhythm but sits just below the Supplier card's bottom edge (the right
    // gutter is too narrow to clear the card horizontally), so the label + bars
    // stay fully in the open gradient. Pulled in (right-[-1%]) so nothing crops.
    key: 'analytics',
    Component: GlassAnalytics,
    className: 'bottom-[3%] right-[-1%]',
    rot: -6,
    scale: 0.9,
    opacity: 0.75,
    dur: '19s',
    delay: '1.2s',
    lower: true,
  },
  {
    // lower-left outer third: hugs / bleeds off the left edge, below the
    // Buyer card — clear of the card's backdrop-blur footprint.
    key: 'contract',
    Component: GlassContract,
    className: 'bottom-[9%] left-[-3%]',
    rot: 10,
    scale: 0.9,
    opacity: 0.75,
    dur: '20s',
    delay: '3.4s',
    lower: true,
  },
];

interface PortalOption {
  id: 'buyer' | 'supplier';
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // gradient for the icon tile
  ring: string; // hover ring color
  features: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }[];
}

const PORTALS: PortalOption[] = [
  {
    id: 'buyer',
    title: 'Buyer Portal',
    tagline: 'For procurement & finance teams',
    description:
      'Raise requisitions, run RFPs, manage purchase orders, receipts, invoices and payments end-to-end.',
    icon: ShoppingCart,
    accent: 'linear-gradient(135deg, #673ee6 0%, #8b5cf6 100%)',
    ring: 'group-hover:ring-[rgb(103,62,230)]/40',
    features: [
      { icon: FileText, label: 'Requisitions & RFPs' },
      { icon: ClipboardCheck, label: 'Approvals' },
      { icon: Package, label: 'Purchase Orders & GRN' },
      { icon: Wallet, label: 'Invoices & Payments' },
    ],
  },
  {
    id: 'supplier',
    title: 'Supplier Portal',
    tagline: 'For vendors & suppliers',
    description:
      'Respond to RFP invitations, submit quotations, track orders and raise invoices with your buyers.',
    icon: Store,
    accent: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
    ring: 'group-hover:ring-sky-400/40',
    features: [
      { icon: FileText, label: 'RFP Invitations' },
      { icon: Receipt, label: 'Submit Quotations' },
      { icon: Package, label: 'Track Orders' },
      { icon: Building2, label: 'Invoices & Profile' },
    ],
  },
];

export function PortalSelection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Already logged in? Skip straight to the app.
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  const handleSelect = (portal: PortalOption) => {
    if (portal.id === 'supplier') {
      // Suppliers who don't yet have an account can also register from login.
      navigate('/login?portal=supplier');
    } else {
      navigate('/login?portal=buyer');
    }
  };

  return (
    <div
      className='relative min-h-screen w-full overflow-hidden flex flex-col'
      style={{
        background:
          'linear-gradient(160deg, #2d1b69 0%, #1a0d3d 55%, #0f0620 100%)',
      }}
    >
      {/* Animated background blobs */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='portal-blob top-[-6rem] right-[-4rem]' />
        <div className='portal-blob bottom-[-8rem] left-[-6rem] portal-delay-2000' />
        <div className='portal-blob top-1/3 left-1/2 portal-delay-1000' />
      </div>

      {/* Composed glass procurement objects */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {GLASS_OBJECTS.map(o => {
          const Obj = o.Component;
          return (
            <div
              key={o.key}
              className={`glass-object absolute ${o.lower ? 'glass-lower ' : ''}${o.className}`}
              style={
                {
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

      {/* Header */}
      <header className='relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6'>
        <img
          src={import.meta.env.BASE_URL + 'riditstack-logo-new-white.png'}
          alt='ProcLeo by RiditStack'
          className='h-9 w-auto'
        />
        <div className='hidden sm:flex items-center gap-2 text-xs font-medium text-white/70'>
          <ShieldCheck className='h-4 w-4 text-indigo-300' />
          Secure enterprise procurement platform
        </div>
      </header>

      {/* Main */}
      <main className='relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 py-8'>
        <div className='text-center mb-10 max-w-2xl'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold uppercase tracking-wider text-indigo-200 mb-5 backdrop-blur'>
            <Sparkles className='h-3.5 w-3.5' />
            Welcome to ProcLeo
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold text-white mb-3'>
            Select Your Login Page
          </h1>
          <p className='text-sm sm:text-base text-white/70 leading-relaxed'>
            Select how you'd like to sign in. Buyers manage the full
            procure-to-pay lifecycle; suppliers respond to opportunities and get
            paid faster.
          </p>
        </div>

        {/* Portal cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16 w-full'>
          {PORTALS.map(portal => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.id}
                type='button'
                onClick={() => handleSelect(portal)}
                className={`portal-card group relative flex items-start gap-5 text-left rounded-xl border border-white/20 p-6 ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:scale-[1.08] hover:shadow-2xl ${portal.ring}`}
              >
                {/* Icon tile */}
                <div
                  className='inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl shadow-lg'
                  style={{ background: portal.accent }}
                >
                  <Icon className='h-7 w-7 text-white' />
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1'>
                  <h2 className='text-2xl font-bold text-white mb-0.5'>
                    {portal.title}
                  </h2>
                  <p className='text-xs font-medium text-indigo-200 mb-2'>
                    {portal.tagline}
                  </p>
                  <p className='text-sm text-white/70 leading-relaxed mb-4'>
                    {portal.description}
                  </p>

                  {/* Feature chips */}
                  <div className='grid grid-cols-2 gap-2 mb-4'>
                    {portal.features.map(f => {
                      const FIcon = f.icon;
                      return (
                        <div
                          key={f.label}
                          className='flex items-center gap-2 rounded-lg bg-white/5 border border-white/5 px-2.5 py-2'
                        >
                          <FIcon className='h-3.5 w-3.5 text-indigo-300 flex-shrink-0' />
                          <span className='text-[11px] font-medium text-white/75 truncate'>
                            {f.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className='flex items-center gap-2 text-sm font-semibold text-white'>
                    <span>Continue to {portal.title}</span>
                    <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className='relative z-10 px-6 sm:px-10 lg:px-16 py-5'>
        <p className='text-center text-[11px] text-white/40'>
          © {new Date().getFullYear()} ProcLeo by RiditStack Pvt Ltd. All
          rights reserved.
        </p>
      </footer>

      {/* Shared float/hide/reduced-motion CSS for the glass objects */}
      <GlassFloatStyles />

      <style>{`
        .portal-blob {
          position: absolute;
          width: 26rem;
          height: 26rem;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%);
          filter: blur(10px);
          opacity: 0.5;
          animation: portalFloat 9s ease-in-out infinite;
        }
        .portal-delay-1000 { animation-delay: 1.5s; }
        .portal-delay-2000 { animation-delay: 3s; }
        @keyframes portalFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-24px) scale(1.08); }
        }
        .portal-card {
          animation: portalCardIn 0.5s ease-out both;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0.02) 100%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          backdrop-filter: blur(20px) saturate(160%);
          box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05), 0 12px 40px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        /* Glossy sheen across the top of the glass */
        .portal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 40%);
          pointer-events: none;
        }
        .portal-card:hover {
          background: linear-gradient(135deg, rgba(15, 6, 32, 0.55) 0%, rgba(15, 6, 32, 0.4) 50%, rgba(15, 6, 32, 0.5) 100%);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .portal-card:nth-child(2) { animation-delay: 0.1s; }
        @keyframes portalCardIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default PortalSelection;
