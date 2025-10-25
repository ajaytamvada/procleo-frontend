import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  Shield, 
  TrendingUp,
  Users,
  Award,
  Zap,
  HeartHandshake,
  Quote
} from 'lucide-react';

interface CompanyInfoSidebarProps {
  variant?: 'login' | 'register' | 'vendor';
}

const testimonials = [
  {
    quote: "RiditStack's Autovitica P2P has transformed our procurement process. We've reduced processing time by 60% and achieved significant cost savings.",
    author: "Rajesh Kumar",
    position: "CFO, TechCorp India",
    company: "Leading Technology Firm"
  },
  {
    quote: "The vendor management system is exceptional. It has streamlined our supplier onboarding and improved our vendor relationships dramatically.",
    author: "Priya Sharma",
    position: "Head of Procurement, Global Manufacturing",
    company: "Fortune 500 Company"
  },
  {
    quote: "Implementing Autovitica P2P was the best decision for our supply chain. The automation and insights have been game-changing.",
    author: "Amit Patel",
    position: "Operations Director, Retail Chain",
    company: "National Retail Network"
  },
  {
    quote: "The real-time analytics and reporting features have given us unprecedented visibility into our procurement operations.",
    author: "Sarah Johnson",
    position: "VP Supply Chain, Healthcare",
    company: "Healthcare Solutions Provider"
  }
];

const achievements = [
  { icon: Award, label: "ISO 27001 Certified", description: "Information Security Management" },
  { icon: Shield, label: "SOC 2 Type II", description: "Security & Compliance Certified" },
  { icon: CheckCircle, label: "GDPR Compliant", description: "Data Protection Standards" },
  { icon: Building2, label: "GST Registered", description: "Government Approved Vendor" },
];

const technologies = [
  "AI-Powered Analytics", "Blockchain Integration", "Cloud Infrastructure",
  "Real-time Processing", "Machine Learning", "Advanced Encryption",
  "API Integration", "Mobile Optimization", "IoT Connectivity"
];

const industries = [
  { name: "Manufacturing", percentage: 35 },
  { name: "Healthcare", percentage: 25 },
  { name: "Retail", percentage: 20 },
  { name: "Technology", percentage: 15 },
  { name: "Financial Services", percentage: 5 },
];

export function CompanyInfoSidebar({ variant = 'login' }: CompanyInfoSidebarProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sections = ['overview', 'achievements', 'testimonials', 'contact'];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused) {
      const sectionInterval = setInterval(() => {
        setCurrentSection((prev) => (prev + 1) % sections.length);
      }, 15000); // Change section every 15 seconds

      return () => clearInterval(sectionInterval);
    }
  }, [isPaused, sections.length]);
  return (
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1f4e 50%, #3a2b5e 100%)'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 animate-pulse" 
             style={{ 
               background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
               animation: 'float 6s ease-in-out infinite'
             }} />
        <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full opacity-10" 
             style={{ 
               background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
               animation: 'float 8s ease-in-out infinite reverse'
             }} />
        <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full opacity-10" 
             style={{ 
               background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
               animation: 'float 7s ease-in-out infinite'
             }} />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .testimonial-enter {
          animation: slideIn 0.5s ease-out;
        }
        
        .section-enter {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
      
      <div className="relative h-full flex items-center justify-center p-6 lg:p-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="w-full max-w-2xl text-white">
        {/* Company Header - Always Visible */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center mr-3" style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)'
            }}>
              <Building2 className="h-7 w-7" style={{ color: '#6366f1' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">RiditStack Pvt Ltd</h2>
              <p className="text-sm opacity-80">Technology Solutions</p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Empowering businesses with innovative procurement solutions
          </p>
        </div>

        {/* Section Navigation Dots */}
        <div className="absolute top-8 right-8 flex flex-col space-y-2">
          {sections.map((section, index) => (
            <button
              key={section}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSection 
                  ? 'h-8 bg-white' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              onClick={() => {
                setCurrentSection(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 10000);
              }}
              aria-label={`Go to ${section} section`}
            />
          ))}
        </div>

        {/* Scrollable Content Sections */}
        <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
          {/* Overview Section */}
          {currentSection === 0 && (
            <div key="overview" className="section-enter">

        {/* Company Stats with Animation */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="flex items-center mb-3">
              <Users className="h-6 w-6 mr-3 opacity-70" />
              <span className="text-3xl font-bold">500+</span>
            </div>
            <p className="text-base opacity-80">Active Clients</p>
          </div>
          <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="flex items-center mb-3">
              <TrendingUp className="h-6 w-6 mr-3 opacity-70" />
              <span className="text-3xl font-bold">40%</span>
            </div>
            <p className="text-base opacity-80">Cost Reduction</p>
          </div>
          <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="flex items-center mb-3">
              <Zap className="h-6 w-6 mr-3 opacity-70" />
              <span className="text-3xl font-bold">2M+</span>
            </div>
            <p className="text-base opacity-80">Transactions</p>
          </div>
          <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
               style={{ 
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="flex items-center mb-3">
              <Award className="h-6 w-6 mr-3 opacity-70" />
              <span className="text-3xl font-bold">15+</span>
            </div>
            <p className="text-base opacity-80">Years Experience</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-3 mb-10">
          <h3 className="text-xl font-semibold mb-5">
            {variant === 'vendor' ? 'Why Partner with RiditStack?' : 'Why Choose Autovitica P2P?'}
          </h3>
          
          {variant === 'vendor' ? (
            <>
              <div className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-2">
                <HeartHandshake className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="font-medium">Trusted Partnership</p>
                  <p className="text-sm opacity-70">Join our network of verified vendors and grow your business</p>
                </div>
              </div>
              <div className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-2">
                <Zap className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="font-medium">Fast Payments</p>
                  <p className="text-sm opacity-70">Automated payment processing with guaranteed timelines</p>
                </div>
              </div>
              <div className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-2">
                <TrendingUp className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="font-medium">Business Growth</p>
                  <p className="text-sm opacity-70">Access to large enterprise procurement opportunities</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-2">
                <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="font-medium">End-to-End Procurement</p>
                  <p className="text-sm opacity-70">Complete P2P lifecycle management in one platform</p>
                </div>
              </div>
              <div className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-2">
                <Shield className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="font-medium">Enterprise Security</p>
                  <p className="text-sm opacity-70">Bank-grade security with role-based access control</p>
                </div>
              </div>
              <div className="flex items-start p-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-2">
                <Award className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <p className="font-medium">Industry Leader</p>
                  <p className="text-sm opacity-70">Trusted by Fortune 500 companies worldwide</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Auto-scrolling Testimonial Carousel */}
        <div 
          className="rounded-xl p-8 mb-10 transition-all duration-300 hover:shadow-2xl" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Quote className="h-10 w-10 mb-6 opacity-50" />
          <div key={currentTestimonial} className="testimonial-enter">
            <p className="text-base italic mb-6 leading-relaxed">
              "{testimonials[currentTestimonial].quote}"
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-semibold">{testimonials[currentTestimonial].author}</p>
                <p className="text-xs opacity-70">{testimonials[currentTestimonial].position}</p>
                <p className="text-xs opacity-50 mt-1">{testimonials[currentTestimonial].company}</p>
              </div>
              <div className="flex space-x-1">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial 
                        ? 'bg-white w-8' 
                        : 'bg-white/30 hover:bg-white/50'
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
          </div>
            </div>
            </div>
          )}
          </div>
        </div>

        {/* Company Info */}
        <div className="space-y-4 text-base">
          <h3 className="text-xl font-semibold mb-5">Contact Us</h3>
          
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-4 flex-shrink-0 opacity-70" />
            <a href="https://www.riditstack.com" target="_blank" rel="noopener noreferrer" 
               className="hover:underline">
              www.riditstack.com
            </a>
          </div>
          
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-4 flex-shrink-0 opacity-70" />
            <a href="mailto:info@riditstack.com" className="hover:underline">
              info@riditstack.com
            </a>
          </div>
          
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-4 flex-shrink-0 opacity-70" />
            <a href="tel:+91-9876543210" className="hover:underline">
              +91 98765 43210
            </a>
          </div>
          
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-4 mt-0.5 flex-shrink-0 opacity-70" />
            <span>
              Bangalore, Karnataka<br />
              India - 560001
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm opacity-70">
          <p>© 2024 RiditStack Pvt Ltd. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default CompanyInfoSidebar;