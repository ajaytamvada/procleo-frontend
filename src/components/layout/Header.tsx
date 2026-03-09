import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  User,
  Menu,
  FileText,
  ShoppingCart,
  Users,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  X,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';
import NotificationBell from '@/components/common/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

interface QuickAction {
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  route: string;
  shortcutKey: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [aiSearchQuery, setAISearchQuery] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  // AI Suggestions
  const aiSuggestions = [
    {
      icon: Clock,
      text: 'What are my pending approvals?',
      category: 'Quick Action',
    },
    {
      icon: TrendingUp,
      text: 'Show purchase trends this month',
      category: 'Analytics',
    },
    {
      icon: FileText,
      text: 'Create a new purchase requisition',
      category: 'Create',
    },
    { icon: Package, text: 'Track order PO-2024-001', category: 'Track' },
    { icon: Users, text: 'Find vendors for IT equipment', category: 'Search' },
  ];

  // Detect if user is on Mac
  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return (
        /Mac|iPod|iPhone|iPad/.test(navigator.platform) ||
        /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
      );
    }
    return false;
  }, []);

  // Get shortcut display array based on OS
  const getShortcutDisplay = useCallback(
    (key: string) => {
      if (isMac) {
        return ['⌘', '⇧', key.toUpperCase()];
      } else {
        return ['Ctrl', 'Shift', key.toUpperCase()];
      }
    },
    [isMac]
  );

  // Quick actions with keyboard shortcuts
  const quickActions: QuickAction[] = [
    {
      label: 'Purchase Requisition',
      shortLabel: 'Create PR',
      description: 'Start a new purchase request',
      icon: FileText,
      route: '/purchase-requisition/create',
      shortcutKey: 'q',
    },
    {
      label: 'Purchase Order',
      shortLabel: 'Create PO',
      description: 'Create a new purchase order',
      icon: ShoppingCart,
      route: '/purchase-orders/create',
      shortcutKey: 'o',
    },
    {
      label: 'Request for Proposal',
      shortLabel: 'Create RFP',
      description: 'Request for proposal from vendors',
      icon: Users,
      route: '/rfp/create',
      shortcutKey: 'p',
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when AI search opens
  useEffect(() => {
    if (isAISearchOpen && aiInputRef.current) {
      setTimeout(() => {
        aiInputRef.current?.focus();
      }, 50);
    }
  }, [isAISearchOpen]);

  // Reset suggestion index when query changes
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [aiSearchQuery]);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Shift + Key
      if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        const key = event.key.toLowerCase();
        const action = quickActions.find(a => a.shortcutKey === key);

        if (action) {
          event.preventDefault();
          navigate(action.route);
          setIsDropdownOpen(false);
        }
      }

      // Open AI search with Cmd/Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsAISearchOpen(prev => !prev);
        if (isAISearchOpen) {
          setAISearchQuery('');
        }
      }

      // Close on Escape
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsUserMenuOpen(false);
        if (isAISearchOpen) {
          setIsAISearchOpen(false);
          setAISearchQuery('');
        }
      }
    },
    [navigate, quickActions, isAISearchOpen]
  );

  // AI Search keyboard navigation
  const handleAISearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < aiSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : aiSuggestions.length - 1
      );
    } else if (event.key === 'Enter' && !aiSearchQuery.trim()) {
      event.preventDefault();
      handleSuggestionClick(aiSuggestions[selectedSuggestionIndex].text);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleShortcutClick = (route: string) => {
    navigate(route);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
    setIsUserMenuOpen(false);
  };

  const handleUserMenuAction = (action: string) => {
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
    setIsUserMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleClickLogo = () => {
    navigate('/');
  };

  const handleAISearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiSearchQuery.trim()) {
      console.log('AI Search:', aiSearchQuery);
      // TODO: Integrate with AI service
      // navigate(`/ai-assistant?q=${encodeURIComponent(aiSearchQuery)}`);
      setIsAISearchOpen(false);
      setAISearchQuery('');
    }
  };

  const handleSuggestionClick = (text: string) => {
    setAISearchQuery(text);
    aiInputRef.current?.focus();
  };

  const handleCloseAISearch = () => {
    setIsAISearchOpen(false);
    setAISearchQuery('');
  };

  // Get current user info
  const currentUser = AuthService.getStoredUser() || {
    employeeName: 'System Administrator',
    username: 'admin',
    email: 'admin@autovitica.com',
    roles: ['ADMIN'],
  };

  // Keyboard shortcut key component
  const ShortcutKey: React.FC<{ keyLabel: string }> = ({ keyLabel }) => (
    <kbd
      className='inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded shadow-sm'
      style={{
        fontFamily:
          keyLabel === '⌘' || keyLabel === '⇧'
            ? '-apple-system, BlinkMacSystemFont, sans-serif'
            : 'inherit',
      }}
    >
      {keyLabel}
    </kbd>
  );

  // Command/Ctrl icon component
  const ModifierIcon: React.FC = () => {
    if (isMac) {
      return (
        <svg
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z' />
        </svg>
      );
    } else {
      return (
        <svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801' />
        </svg>
      );
    }
  };
  const handleAiClick = () => {
    setShowSearch(true);
  };

  return (
    <>
      <header
        style={{
          backgroundColor: 'rgb(19, 9, 81)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Left side */}
        <div className='flex items-center gap-4'>
          <button
            onClick={onMenuClick}
            className='lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors'
          >
            <Menu className='w-5 h-5' />
          </button>

          <div
            className='flex items-center cursor-pointer gap-1'
            onClick={() => handleClickLogo()}
          >
            <div className='w-8 h-8 rounded-lg flex items-center justify-center shadow-lg'>
              <img
                src={
                  import.meta.env.BASE_URL + 'riditstack-logo-icon-white.png'
                }
                alt='RiditStack Logo'
                className='h-9 w-auto'
              />
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-lg font-semibold text-white'>RiditStack</h1>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-2'>
          {/* AI Search Trigger - Stripe/Linear Style */}
          {showSearch ? (
            <>
              <button
                onClick={() => setIsAISearchOpen(true)}
                className='hidden md:flex items-center gap-2 h-9 pl-3 pr-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.15] rounded-lg transition-all duration-200 group cursor-text'
              >
                <Search className='w-4 h-4 text-white/40' />
                <span className='text-sm text-white/40 group-hover:text-white/50 min-w-[140px] text-left'>
                  Ask AI anything...
                </span>
                <div className='flex items-center gap-0.5 ml-2'>
                  <kbd className='h-5 px-1.5 text-[11px] font-medium text-white/30 bg-white/[0.08] border border-white/[0.08] rounded flex items-center justify-center'>
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd className='h-5 px-1.5 text-[11px] font-medium text-white/30 bg-white/[0.08] border border-white/[0.08] rounded flex items-center justify-center'>
                    K
                  </kbd>
                </div>
              </button>

              {/* Mobile AI Icon */}
              <button
                onClick={() => setIsAISearchOpen(true)}
                className='md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors'
              >
                <Sparkles className='w-5 h-5' />
              </button>
            </>
          ) : (
            <img
              src={import.meta.env.BASE_URL + 'ai-icon.png'}
              alt='AI'
              className='h-9 w-auto'
              onClick={() => handleAiClick()}
            />
          )}

          {/* Quick Actions for non-vendor users */}
          {!(
            currentUser.roles?.includes('ROLE_VENDOR') ||
            currentUser.roles?.includes('VENDOR') ||
            (currentUser as any).vendorId
          ) && (
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border text-white text-sm font-semibold transition-all duration-200 group ${
                  isDropdownOpen
                    ? 'bg-indigo-500/20 border-indigo-400'
                    : 'border-indigo-400/60 hover:bg-indigo-500/20 hover:border-indigo-400'
                }`}
                title='Quick Actions'
              >
                <span>+ Create</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className='absolute right-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200'>
                  <div className='py-1'>
                    {quickActions.map((action, index) => {
                      const isHovered = hoveredIndex === index;
                      const shortcutDisplay = getShortcutDisplay(
                        action.shortcutKey
                      );

                      return (
                        <button
                          key={action.route}
                          onClick={() => handleShortcutClick(action.route)}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className={`w-full flex items-start justify-between px-5 py-4 text-left transition-colors duration-150 border-l-4 ${
                            isHovered
                              ? 'bg-gray-50 border-l-violet-600'
                              : 'border-l-transparent'
                          }`}
                        >
                          <div className='flex-1 pr-4'>
                            <div className='text-base font-semibold text-gray-900'>
                              {action.label}
                            </div>
                            <p className='text-sm text-gray-500 mt-1'>
                              {action.description}
                            </p>
                          </div>
                          <div className='flex items-center gap-1 flex-shrink-0 pt-0.5'>
                            {shortcutDisplay.map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                <ShortcutKey keyLabel={key} />
                                {keyIndex < shortcutDisplay.length - 1 && (
                                  <span className='text-gray-400 text-xs'>
                                    +
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className='px-5 py-3 bg-gray-50 border-t border-gray-100'>
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <ModifierIcon />
                      <span>
                        Use{' '}
                        {isMac ? 'keyboard shortcuts' : 'Ctrl + Shift + Key'}{' '}
                        for quick access
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <NotificationBell />

          {/* Settings Icon */}
          <button
            onClick={handleSettingsClick}
            className='p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200'
            title='Settings'
          >
            <Settings className='w-5 h-5' />
          </button>

          {/* User menu */}
          <div className='relative' ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className='flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors duration-200'
            >
              <div className='hidden sm:block text-right'>
                <div className='text-xs font-medium text-white'>
                  {currentUser.employeeName || currentUser.username}
                </div>
                <div className='text-[10px] text-white/60'>
                  {(currentUser as any).vendorId
                    ? 'Vendor'
                    : currentUser.roles?.[0] || 'User'}
                </div>
              </div>
              <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center'>
                <User className='w-4 h-4 text-white' />
              </div>
            </button>

            {isUserMenuOpen && (
              <div className='absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200'>
                <div className='px-4 py-4 bg-gray-50 border-b border-gray-100'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center'>
                      <UserCircle className='w-6 h-6 text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='font-semibold text-gray-900 truncate'>
                        {currentUser.employeeName || currentUser.username}
                      </div>
                      <div className='text-sm text-gray-500 truncate'>
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='py-2'>
                  <button
                    onClick={() => handleUserMenuAction('profile')}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors duration-150'
                  >
                    <UserCircle className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>
                      My Profile
                    </span>
                  </button>
                  <button
                    onClick={() => handleUserMenuAction('settings')}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors duration-150'
                  >
                    <Settings className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>
                      Settings
                    </span>
                  </button>
                  <div className='border-t border-gray-100 my-2'></div>
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors duration-150 group'
                  >
                    <LogOut className='w-4 h-4 text-gray-500 group-hover:text-red-500' />
                    <span className='text-sm font-medium text-gray-700 group-hover:text-red-600'>
                      Log out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* AI Command Palette Modal */}
      {isAISearchOpen && (
        <div className='fixed inset-0 z-[100]'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-gray-900/60 backdrop-blur-sm'
            onClick={handleCloseAISearch}
            style={{ animation: 'fadeIn 150ms ease-out' }}
          />

          {/* Modal Container */}
          <div className='relative flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4'>
            <div
              className='w-full max-w-[580px] bg-white rounded-xl shadow-2xl overflow-hidden'
              style={{ animation: 'modalSlideIn 200ms ease-out' }}
            >
              {/* Search Input */}
              <form onSubmit={handleAISearchSubmit}>
                <div className='relative flex items-center border-b border-gray-200'>
                  <div className='absolute left-4 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg'>
                    <Sparkles className='w-4 h-4 text-white' />
                  </div>
                  <input
                    ref={aiInputRef}
                    type='text'
                    value={aiSearchQuery}
                    onChange={e => setAISearchQuery(e.target.value)}
                    onKeyDown={handleAISearchKeyDown}
                    placeholder='Ask AI anything...'
                    className='w-full pl-16 pr-12 py-4 text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none'
                    autoComplete='off'
                    spellCheck='false'
                  />
                  {aiSearchQuery ? (
                    <button
                      type='submit'
                      className='absolute right-3 p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors'
                    >
                      <ArrowRight className='w-5 h-5' />
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={handleCloseAISearch}
                      className='absolute right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions */}
              <div className='max-h-[340px] overflow-y-auto'>
                <div className='p-2'>
                  <div className='px-3 py-2'>
                    <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>
                      Suggestions
                    </span>
                  </div>
                  {aiSuggestions.map((item, index) => {
                    const isSelected = selectedSuggestionIndex === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item.text)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-100 group ${
                          isSelected ? 'bg-violet-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-violet-100 text-violet-600'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                          }`}
                        >
                          <item.icon className='w-4 h-4' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div
                            className={`text-sm font-medium truncate transition-colors ${
                              isSelected ? 'text-violet-900' : 'text-gray-700'
                            }`}
                          >
                            {item.text}
                          </div>
                          <div className='text-xs text-gray-400 mt-0.5'>
                            {item.category}
                          </div>
                        </div>
                        {isSelected && (
                          <div className='flex items-center gap-1'>
                            <kbd className='h-5 px-1.5 text-[10px] font-medium text-violet-500 bg-violet-100 rounded flex items-center'>
                              ↵
                            </kbd>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className='px-4 py-3 bg-gray-50 border-t border-gray-100'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 text-xs text-gray-500'>
                    <div className='flex items-center gap-1.5'>
                      <kbd className='h-5 px-1.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm flex items-center'>
                        ↑
                      </kbd>
                      <kbd className='h-5 px-1.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm flex items-center'>
                        ↓
                      </kbd>
                      <span className='ml-0.5'>Navigate</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <kbd className='h-5 px-1.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm flex items-center'>
                        ↵
                      </kbd>
                      <span className='ml-0.5'>Select</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <kbd className='h-5 px-1.5 text-[10px] font-medium text-gray-500 bg-white border border-gray-200 rounded shadow-sm flex items-center'>
                        esc
                      </kbd>
                      <span className='ml-0.5'>Close</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <div className='w-4 h-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded flex items-center justify-center'>
                      <Sparkles className='w-2.5 h-2.5 text-white' />
                    </div>
                    <span>Powered by AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
