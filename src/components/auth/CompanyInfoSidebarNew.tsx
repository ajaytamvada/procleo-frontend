import { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  Users,
  Award,
  Zap,
  HeartHandshake,
  Quote,
  Star,
  Target,
  Clock,
  DollarSign,
  Package,
  BarChart3,
  Briefcase,
} from 'lucide-react';

interface CompanyInfoSidebarProps {
  variant?: 'login' | 'register' | 'vendor';
}

const testimonials = [
  {
    quote:
      "RiditStack's ProcLeo P2P has transformed our procurement process. We've reduced processing time by 60% and achieved significant cost savings.",
    author: 'Rajesh Kumar',
    position: 'CFO, TechCorp India',
    rating: 5,
  },
  {
    quote:
      'The vendor management system is exceptional. It has streamlined our supplier onboarding and improved our vendor relationships dramatically.',
    author: 'Priya Sharma',
    position: 'Head of Procurement',
    rating: 5,
  },
  {
    quote:
      'Implementing ProcLeo P2P was the best decision for our supply chain. The automation and insights have been game-changing.',
    author: 'Amit Patel',
    position: 'Operations Director',
    rating: 5,
  },
];

// ---------------------------------------------------------------------------
// Buyer-login right panel — a static, single-viewport, fully on-theme panel:
//   a) 2×2 stats grid   b) industry distribution   c) 3-way-match vignette
// Replaces the auto-rotating carousel (kept for register/vendor) and the raster
// banner illustration.
// ---------------------------------------------------------------------------

const LOGIN_STATS = [
  {
    icon: Users,
    value: '500+',
    label: 'Active Clients',
    tint: 'text-indigo-300',
  },
  {
    icon: TrendingUp,
    value: '40%',
    label: 'Cost Reduction',
    tint: 'text-emerald-300',
  },
  { icon: Package, value: '2M+', label: 'Transactions', tint: 'text-sky-300' },
  {
    icon: Clock,
    value: '24/7',
    label: 'Support Available',
    tint: 'text-purple-300',
  },
];

const LOGIN_INDUSTRIES = [
  { name: 'Manufacturing', value: 35, color: '#6366f1' },
  { name: 'Healthcare', value: 25, color: '#8b5cf6' },
  { name: 'Retail', value: 20, color: '#a855f7' },
  { name: 'Technology', value: 15, color: '#c084fc' },
  { name: 'Financial', value: 5, color: '#d8b4fe' },
];

// Three overlapping glass cards telling the PO → Invoice → GRN matching story,
// in our glass language (muted green pills = semantic status only).
const MATCH_CARDS = [
  {
    label: 'APPROVED PO',
    status: 'Validated',
    rot: -4,
    z: 10,
    left: 2,
    top: 14,
  },
  {
    label: 'SUPPLIER INVOICE',
    status: 'Matched',
    rot: 0,
    z: 20,
    left: 72,
    top: 2,
  },
  { label: 'GRN', status: 'Approved', rot: 4, z: 30, left: 142, top: 14 },
];

function ThreeWayMatchVignette() {
  return (
    <div>
      <div className='tw-vignette'>
        {/* dashed connector linking the three amount rows */}
        <div className='tw-connector' />
        {MATCH_CARDS.map(c => (
          <div
            key={c.label}
            className='tw-card'
            style={{
              left: c.left,
              top: c.top,
              zIndex: c.z,
              transform: `rotate(${c.rot}deg)`,
            }}
          >
            <div className='tw-label'>{c.label}</div>
            <div className='tw-line' />
            <div className='tw-line tw-line-short' />
            <div className='tw-amount'>$220,000</div>
            <div className='tw-pill'>
              <Check className='tw-check' />
              {c.status}
            </div>
          </div>
        ))}
      </div>
      <p className='tw-caption'>3-way matching, automated.</p>
      <style>{`
        .tw-vignette { position: relative; height: 128px; width: 282px; margin: 0 auto; }
        .tw-card {
          position: absolute;
          width: 138px;
          padding: 11px 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow:
            inset 0 1px 0 0 rgba(255,255,255,0.18),
            0 10px 24px -10px rgba(0,0,0,0.55);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
        }
        .tw-label { font-size: 9px; letter-spacing: 1px; font-weight: 600; color: rgba(255,255,255,0.5); }
        .tw-line { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.16); margin-top: 8px; }
        .tw-line-short { width: 58%; background: rgba(255,255,255,0.12); }
        .tw-amount { margin-top: 9px; font-size: 13px; font-weight: 600; color: #fff; font-variant-numeric: tabular-nums; }
        .tw-pill {
          display: inline-flex; align-items: center; gap: 3px;
          margin-top: 9px; padding: 2px 7px; border-radius: 9999px;
          background: rgba(74,222,128,0.15); color: #86EFAC;
          font-size: 10px; font-weight: 600;
        }
        .tw-check { width: 10px; height: 10px; }
        .tw-connector {
          position: absolute; left: 10px; right: 10px; top: 68px;
          border-top: 1px dashed rgba(255,255,255,0.30);
          z-index: 25;
        }
        .tw-caption { margin-top: 14px; font-size: 13px; color: rgba(255,255,255,0.55); text-align: center; }
      `}</style>
    </div>
  );
}

function LoginInfoPanel() {
  return (
    <aside
      className='hidden lg:flex lg:w-[380px] lg:min-w-[380px] lg:h-screen relative overflow-hidden'
      style={{
        background:
          'linear-gradient(180deg, #2d1b69 0%, #1a0d3d 50%, #0f0620 100%)',
      }}
    >
      {/* soft floating glow */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='bp-float top-10 -right-10' />
        <div className='bp-float top-1/3 -left-20 bp-delay-1' />
        <div className='bp-float bottom-24 right-16 bp-delay-2' />
      </div>

      <div className='relative h-full w-full flex flex-col text-white bp-panel-inner'>
        {/* a) Stats grid (natural height) */}
        <div className='grid grid-cols-2 bp-stats-grid'>
          {LOGIN_STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className='bp-card bp-stat'>
                <Icon className={`h-4 w-4 mb-1.5 ${s.tint}`} />
                <div className='bp-stat-value'>{s.value}</div>
                <div className='bp-stat-label'>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* b) Industry distribution (natural height) */}
        <div className='bp-card bp-industry'>
          <h3 className='bp-industry-title'>
            <BarChart3 className='h-4 w-4' />
            Industry Distribution
          </h3>
          <div className='bp-industry-rows'>
            {LOGIN_INDUSTRIES.map(ind => (
              <div key={ind.name}>
                <div className='bp-industry-row'>
                  <span>{ind.name}</span>
                  <span>{ind.value}%</span>
                </div>
                <div className='bp-bar-track'>
                  <div
                    className='bp-bar-fill'
                    style={{ width: `${ind.value}%`, background: ind.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* c) Three-way match vignette — takes the remaining space and centres
            within it (scaled on short viewports so it never clips the bottom). */}
        <div className='bp-vignette-slot'>
          <div className='bp-vignette-scale'>
            <ThreeWayMatchVignette />
          </div>
        </div>
      </div>

      <style>{`
        .bp-float {
          position: absolute; width: 150px; height: 150px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
          opacity: 0.15; animation: bpFloat 6s ease-in-out infinite;
        }
        .bp-delay-1 { animation-delay: 1s; }
        .bp-delay-2 { animation-delay: 2s; }
        @keyframes bpFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) { .bp-float { animation: none; } }

        /* Explicit flex column: the two top cards keep their natural height and
           the vignette takes ALL remaining space, centring within it — so it can
           never be crushed against the bottom edge. */
        .bp-panel-inner { padding: 32px; gap: 24px; }
        .bp-stats-grid { flex: none; gap: 12px; }
        .bp-industry { flex: none; padding: 18px; }
        .bp-vignette-slot {
          flex: 1; min-height: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .bp-vignette-scale { transform-origin: center; }
        /* Scale the vignette down on shorter viewports (clamped 0.75–1) so the
           full composition + caption always fits its slot with clearance. */
        @media (max-height: 880px) { .bp-vignette-scale { transform: scale(0.92); } }
        @media (max-height: 800px) { .bp-vignette-scale { transform: scale(0.85); } }
        @media (max-height: 720px) { .bp-vignette-scale { transform: scale(0.75); } }

        .bp-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
        }
        .bp-stat { padding: 13px 14px; display: flex; flex-direction: column; }
        .bp-stat-value { font-size: 20px; font-weight: 700; line-height: 1.1; }
        .bp-stat-label { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 3px; }

        .bp-industry-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; margin-bottom: 12px;
        }
        .bp-industry-rows { display: flex; flex-direction: column; gap: 8px; }
        .bp-industry-row {
          display: flex; justify-content: space-between;
          font-size: 13px; margin-bottom: 4px; color: rgba(255,255,255,0.85);
        }
        .bp-bar-track {
          width: 100%; height: 4px; border-radius: 9999px;
          background: rgba(255,255,255,0.15); overflow: hidden;
        }
        .bp-bar-fill { height: 100%; border-radius: 9999px; }
      `}</style>
    </aside>
  );
}

function CarouselPanel({ variant = 'login' }: CompanyInfoSidebarProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const sections = [
    { id: 'stats', label: 'Overview', duration: 15000 },
    { id: 'achievements', label: 'Achievements', duration: 12000 },
    { id: 'testimonials', label: 'Testimonials', duration: 15000 },
    { id: 'tech', label: 'Technology', duration: 10000 },
  ];

  // Auto-scroll sections
  useEffect(() => {
    if (!isPaused) {
      const timer = setTimeout(() => {
        setCurrentSection(prev => (prev + 1) % sections.length);
      }, sections[currentSection].duration);

      return () => clearTimeout(timer);
    }
  }, [currentSection, isPaused, sections]);

  // Auto-scroll testimonials
  useEffect(() => {
    if (!isPaused && currentSection === 2) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPaused, currentSection]);

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Stats Overview
        return (
          <div key='stats' className='section-enter space-y-6'>
            {/* Company Stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='stat-card'>
                <Users className='h-6 w-6 mb-2 text-indigo-300' />
                <div className='text-2xl font-bold mb-1'>500+</div>
                <div className='text-xs opacity-80'>Active Clients</div>
              </div>
              <div className='stat-card'>
                <TrendingUp className='h-6 w-6 mb-2 text-green-300' />
                <div className='text-2xl font-bold mb-1'>40%</div>
                <div className='text-xs opacity-80'>Cost Reduction</div>
              </div>
              <div className='stat-card'>
                <Package className='h-6 w-6 mb-2 text-blue-300' />
                <div className='text-2xl font-bold mb-1'>2M+</div>
                <div className='text-xs opacity-80'>Transactions</div>
              </div>
              <div className='stat-card'>
                <Clock className='h-6 w-6 mb-2 text-purple-300' />
                <div className='text-2xl font-bold mb-1'>24/7</div>
                <div className='text-xs opacity-80'>Support Available</div>
              </div>
            </div>

            {/* Industry Distribution */}
            <div className='bg-white/10 rounded-xl p-5 backdrop-blur'>
              <h3 className='text-sm font-semibold mb-3 flex items-center'>
                <BarChart3 className='h-4 w-4 mr-2' />
                Industry Distribution
              </h3>
              <div className='space-y-2'>
                {[
                  { name: 'Manufacturing', value: 35, color: '#6366f1' },
                  { name: 'Healthcare', value: 25, color: '#8b5cf6' },
                  { name: 'Retail', value: 20, color: '#a855f7' },
                  { name: 'Technology', value: 15, color: '#c084fc' },
                  { name: 'Financial', value: 5, color: '#d8b4fe' },
                ].map(industry => (
                  <div key={industry.name}>
                    <div className='flex justify-between text-xs mb-1'>
                      <span>{industry.name}</span>
                      <span>{industry.value}%</span>
                    </div>
                    <div className='w-full bg-white/20 rounded-full h-1.5'>
                      <div
                        className='h-full rounded-full transition-all duration-1000'
                        style={{
                          width: `${industry.value}%`,
                          background: industry.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: // Achievements
        return (
          <div key='achievements' className='section-enter space-y-4'>
            <h3 className='text-lg font-semibold mb-3'>Our Achievements</h3>

            {[
              {
                icon: Award,
                title: 'ISO 27001 Certified',
                desc: 'Information Security Management',
                year: '2022',
              },
              {
                icon: Shield,
                title: 'SOC 2 Type II',
                desc: 'Security & Compliance',
                year: '2023',
              },
              {
                icon: Star,
                title: 'Best P2P Platform',
                desc: 'Industry Excellence Award',
                year: '2024',
              },
              {
                icon: Target,
                title: '99.9% Uptime',
                desc: 'Reliability Guaranteed',
                year: '2024',
              },
            ].map((achievement, idx) => (
              <div key={idx} className='achievement-card'>
                <achievement.icon className='h-8 w-8 text-indigo-300' />
                <div className='flex-1 min-w-0'>
                  <div className='font-semibold text-sm'>
                    {achievement.title}
                  </div>
                  <div className='text-xs opacity-70 truncate'>
                    {achievement.desc}
                  </div>
                </div>
                <div className='text-xs opacity-50'>{achievement.year}</div>
              </div>
            ))}

            <div className='bg-white/10 rounded-xl p-4 backdrop-blur mt-4'>
              <h4 className='font-semibold text-sm mb-3'>Global Presence</h4>
              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div>
                  <div className='text-xl font-bold text-indigo-300'>15+</div>
                  <div className='opacity-80'>Countries</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-indigo-300'>50+</div>
                  <div className='opacity-80'>Cities</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-indigo-300'>100+</div>
                  <div className='opacity-80'>Partners</div>
                </div>
                <div>
                  <div className='text-xl font-bold text-indigo-300'>1000+</div>
                  <div className='opacity-80'>Employees</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Testimonials
        return (
          <div key='testimonials' className='section-enter'>
            <h3 className='text-lg font-semibold mb-4'>What Our Clients Say</h3>

            <div className='bg-white/10 rounded-xl p-5 backdrop-blur'>
              <Quote className='h-8 w-8 mb-3 text-indigo-300' />
              <div key={currentTestimonial} className='testimonial-enter'>
                <p className='text-sm italic mb-4 leading-relaxed'>
                  "{testimonials[currentTestimonial].quote}"
                </p>

                {/* Rating Stars */}
                <div className='flex mb-3'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-current text-yellow-400'
                    />
                  ))}
                </div>

                <div>
                  <p className='font-semibold text-sm'>
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className='text-xs opacity-70'>
                    {testimonials[currentTestimonial].position}
                  </p>
                </div>
              </div>

              {/* Testimonial Dots */}
              <div className='flex space-x-2 mt-4'>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/30 hover:bg-white/50'
                    }`}
                    onClick={() => {
                      setCurrentTestimonial(index);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 5000);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Client Logos */}
            {/* <div className='mt-6'>
              <p className='text-xs opacity-70 mb-3'>
                Trusted by Industry Leaders
              </p>
              <div className='grid grid-cols-3 gap-2 opacity-50'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='bg-white/10 rounded p-3 h-10' />
                ))}
              </div>
            </div> */}
          </div>
        );

      case 3: // Technology
        return (
          <div key='tech' className='section-enter space-y-4'>
            <h3 className='text-lg font-semibold mb-3'>
              Cutting-Edge Technology
            </h3>

            <div className='grid grid-cols-3 gap-2'>
              {[
                'AI Analytics',
                'Blockchain',
                'Cloud Native',
                'Real-time Data',
                'ML Insights',
                'Advanced Security',
                'API First',
                'Mobile Ready',
                'IoT Integration',
              ].map((tech, idx) => (
                <div key={idx} className='tech-badge'>
                  {tech}
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className='space-y-3 mt-4'>
              {variant === 'vendor' ? (
                <>
                  <div className='feature-item'>
                    <HeartHandshake className='h-5 w-5 mr-3 text-indigo-300 flex-shrink-0' />
                    <div>
                      <p className='font-medium text-sm'>Seamless Onboarding</p>
                      <p className='text-xs opacity-70'>
                        Get started in minutes with our guided process
                      </p>
                    </div>
                  </div>
                  <div className='feature-item'>
                    <DollarSign className='h-5 w-5 mr-3 text-green-300 flex-shrink-0' />
                    <div>
                      <p className='font-medium text-sm'>Faster Payments</p>
                      <p className='text-xs opacity-70'>
                        Automated payment processing with instant notifications
                      </p>
                    </div>
                  </div>
                  <div className='feature-item'>
                    <Briefcase className='h-5 w-5 mr-3 text-blue-300 flex-shrink-0' />
                    <div>
                      <p className='font-medium text-sm'>Business Growth</p>
                      <p className='text-xs opacity-70'>
                        Access to enterprise opportunities and bulk orders
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='feature-item'>
                    <CheckCircle className='h-5 w-5 mr-3 text-green-300 flex-shrink-0' />
                    <div>
                      <p className='font-medium text-sm'>
                        Complete P2P Solution
                      </p>
                      <p className='text-xs opacity-70'>
                        End-to-end procurement lifecycle management
                      </p>
                    </div>
                  </div>
                  <div className='feature-item'>
                    <Shield className='h-5 w-5 mr-3 text-blue-300 flex-shrink-0' />
                    <div>
                      <p className='font-medium text-sm'>Enterprise Security</p>
                      <p className='text-xs opacity-70'>
                        Bank-grade security with compliance certifications
                      </p>
                    </div>
                  </div>
                  <div className='feature-item'>
                    <Zap className='h-5 w-5 mr-3 text-yellow-300 flex-shrink-0' />
                    <div>
                      <p className='font-medium text-sm'>Lightning Fast</p>
                      <p className='text-xs opacity-70'>
                        Process orders 10x faster than traditional methods
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <aside
      className='hidden lg:flex lg:w-[380px] lg:min-w-[380px] lg:h-screen relative overflow-hidden'
      style={{
        background:
          'linear-gradient(180deg, #2d1b69 0%, #1a0d3d 50%, #0f0620 100%)',
      }}
    >
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='floating-element top-10 -right-10' />
        <div className='floating-element top-1/3 -left-20 delay-1000' />
        <div className='floating-element bottom-20 right-20 delay-2000' />
      </div>

      {/* Main Content */}
      <div
        className='relative h-full flex flex-col p-6 text-white w-full'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Company Header */}
        {/* <div className='mb-5'>
          <div className='flex items-center mb-3'>
            <img
              src={import.meta.env.BASE_URL + 'riditstack-logo.png'}
              alt='RiditStack Logo'
              className='h-10 w-auto mr-3'
            />
            <div>
              <h2 className='text-lg font-bold'>RiditStack Pvt Ltd</h2>
              <p className='text-xs opacity-80'>Autovitica P2P Platform</p>
            </div>
          </div>
        </div> */}

        {/* Section Indicators - Horizontal lines like Cashfree */}

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar mt-5 flex flex-col'>
          {renderSection()}

          <div className='flex space-x-2 mb-5 mt-5'>
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  index === currentSection
                    ? 'bg-white'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                onClick={() => {
                  setCurrentSection(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                aria-label={section.label}
              />
            ))}
          </div>
          <div className='mt-auto'>
            <ThreeWayMatchVignette />
          </div>
        </div>

        {/* Contact Info - Always Visible */}
        {/* <div className='mt-4 pt-4 border-t border-white/20'>
          <div className='flex flex-col gap-2 text-xs'>
            <a
              href='mailto:info@riditstack.com'
              className='flex items-center hover:underline opacity-80 hover:opacity-100'
            >
              <Mail className='h-3.5 w-3.5 mr-2' />
              info@riditstack.com
            </a>
            <a
              href='tel:+919876543210'
              className='flex items-center hover:underline opacity-80 hover:opacity-100'
            >
              <Phone className='h-3.5 w-3.5 mr-2' />
              +91 98765 43210
            </a>
            <a
              href='https://riditstack.com'
              className='flex items-center hover:underline opacity-80 hover:opacity-100'
            >
              <Globe className='h-3.5 w-3.5 mr-2' />
              riditstack.com
            </a>
          </div>
        </div> */}
      </div>

      {/* CSS for animations */}
      <style>{`
        .floating-element {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
          opacity: 0.15;
          animation: float 6s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }

        .section-enter {
          animation: fadeInUp 0.6s ease-out;
        }

        .testimonial-enter {
          animation: slideIn 0.4s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: scale(1.03);
          background: rgba(255, 255, 255, 0.15);
        }

        .achievement-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .achievement-card:hover {
          transform: translateX(5px);
          background: rgba(255, 255, 255, 0.15);
        }

        .tech-badge {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px;
          text-align: center;
          font-size: 10px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .tech-badge:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .feature-item:hover {
          transform: translateX(5px);
          background: rgba(255, 255, 255, 0.15);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </aside>
  );
}

// Buyer/default login gets the new static single-viewport panel; register and
// vendor keep the existing auto-rotating carousel.
export function CompanyInfoSidebar({
  variant = 'login',
}: CompanyInfoSidebarProps) {
  if (variant === 'login') {
    return <LoginInfoPanel />;
  }
  return <CarouselPanel variant={variant} />;
}

export default CompanyInfoSidebar;
