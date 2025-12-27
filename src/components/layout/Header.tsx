import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';
import NotificationBell from '@/components/common/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const shortcuts = [
    {
      label: 'Create Purchase Requisition',
      shortLabel: 'Create PR',
      icon: FileText,
      route: '/purchase-requisition/create',
      color: 'from-blue-500 to-blue-600',
      description: 'Start a new purchase request',
    },
    {
      label: 'Create Purchase Order',
      shortLabel: 'Create PO',
      icon: ShoppingCart,
      route: '/purchase-orders/create',
      color: 'from-green-500 to-green-600',
      description: 'Create a new purchase order',
    },
    {
      label: 'Create RFP',
      shortLabel: 'Create RFP',
      icon: Users,
      route: '/rfp/create',
      color: 'from-purple-500 to-purple-600',
      description: 'Request for proposal from vendors',
    },
  ];

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
        navigate('/settings');
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

  // Get current user info
  const currentUser = AuthService.getStoredUser() || {
    employeeName: 'System Administrator',
    username: 'admin',
    email: 'admin@autovitica.com',
    roles: ['ADMIN'],
  };

  return (
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

        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-lg'>
            <img
              src='/riditstack-logo.png'
              alt='RiditStack Logo'
              className='h-9 w-auto'
            />
          </div>
          <div className='hidden sm:block'>
            <h1 className='text-lg font-semibold text-white'>Procleo</h1>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className='flex items-center gap-2'>
        {/* Quick Actions Dropdown */}
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border border-indigo-400/60 text-white text-xs font-semibold hover:bg-indigo-500/20 hover:border-indigo-400 transition-all duration-200 group'
            title='Quick Actions'
          >
            <span>+ Create</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className='absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200'>
              <div className='px-4 py-2 border-b border-gray-100'>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Quick Actions
                </h3>
                <p className='text-xs text-gray-500 mt-1'>
                  Create new procurement items
                </p>
              </div>

              {shortcuts.map(shortcut => {
                const IconComponent = shortcut.icon;
                return (
                  <button
                    key={shortcut.route}
                    onClick={() => handleShortcutClick(shortcut.route)}
                    className='w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 group'
                  >
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${shortcut.color} rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm`}
                    >
                      <IconComponent className='w-4 h-4 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-gray-900'>
                        {shortcut.label}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {shortcut.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Settings Icon */}
        <button
          onClick={handleSettingsClick}
          className='p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200'
          title='Settings'
        >
          <Settings className='w-4 h-4' />
        </button>

        {/* User menu */}
        <div className='relative' ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className='flex items-center gap-2 hover:bg-indigo-500/20 rounded-lg px-2 py-1 transition-colors duration-200'
          >
            <div className='hidden sm:block text-right'>
              <div className='text-xs font-medium text-white'>
                {currentUser.employeeName || currentUser.username}
              </div>
              <div className='text-[10px] text-white/60'>
                {currentUser.roles?.[0] || 'User'}
              </div>
            </div>
            <div className='p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <User className='w-4 h-4 text-white' />
            </div>
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200'>
              {/* User Info Header */}
              <div className='px-4 py-3 border-b border-gray-100'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                    <UserCircle className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      {currentUser.employeeName || currentUser.username}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {currentUser.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className='py-1'>
                <button
                  onClick={() => handleUserMenuAction('profile')}
                  className='w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150'
                >
                  <UserCircle className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-700'>My Profile</span>
                </button>

                <button
                  onClick={() => handleUserMenuAction('settings')}
                  className='w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150'
                >
                  <Settings className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-700'>Settings</span>
                </button>

                <div className='border-t border-gray-100 my-1'></div>

                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 transition-colors duration-150 group'
                >
                  <LogOut className='w-4 h-4 text-gray-500 group-hover:text-red-500' />
                  <span className='text-sm text-gray-700 group-hover:text-red-600'>
                    Log out
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
