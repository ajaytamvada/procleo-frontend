import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Save,
  ChevronLeft,
  Camera,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MyProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'notifications' | 'security'
  >('profile');
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUser = user || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    department: 'Procurement',
    designation: 'Manager',
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none';

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className='space-y-8'>
            {/* Profile Picture */}
            <div className='flex items-center gap-6 pb-6 border-b border-gray-100'>
              <div className='relative'>
                <div className='w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold'>
                  {currentUser.firstName?.charAt(0)}
                  {currentUser.lastName?.charAt(0)}
                </div>
                <button className='absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 shadow'>
                  <Camera className='w-4 h-4' />
                </button>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className='text-sm text-gray-500'>
                  {currentUser.designation} • {currentUser.department}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  First Name
                </label>
                <input
                  defaultValue={currentUser.firstName}
                  className={inputClass}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Last Name
                </label>
                <input
                  defaultValue={currentUser.lastName}
                  className={inputClass}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  defaultValue={currentUser.email}
                  className={inputClass}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Phone
                </label>
                <input
                  defaultValue={currentUser.phone}
                  className={inputClass}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Department
                </label>
                <input
                  disabled
                  defaultValue={currentUser.department}
                  className={`${inputClass} bg-gray-50`}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Designation
                </label>
                <input
                  disabled
                  defaultValue={currentUser.designation}
                  className={`${inputClass} bg-gray-50`}
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <button className='inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700'>
                <Save className='w-4 h-4' />
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className='space-y-6'>
            {[
              {
                title: 'Email Notifications',
                desc: 'Receive emails about PRs.',
                checked: true,
              },
              {
                title: 'Push Notifications',
                desc: 'Real-time alerts.',
                checked: true,
              },
              {
                title: 'SMS Notifications',
                desc: 'Urgent SMS alerts.',
                checked: false,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {item.title}
                  </p>
                  <p className='text-sm text-gray-500'>{item.desc}</p>
                </div>
                <input
                  type='checkbox'
                  defaultChecked={item.checked}
                  className='h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500'
                />
              </div>
            ))}

            <div className='flex justify-end'>
              <button className='inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700'>
                <Save className='w-4 h-4' />
                Save Preferences
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className='space-y-6 max-w-xl'>
            {['Current Password', 'New Password', 'Confirm New Password'].map(
              (label, idx) => (
                <div key={idx}>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    {label}
                  </label>
                  <input type='password' className={inputClass} />
                </div>
              )
            )}

            <div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Password Requirements
              </p>
              <ul className='text-sm text-gray-600 list-disc list-inside space-y-1'>
                <li>Minimum 8 characters</li>
                <li>Upper & lowercase letters</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>

            <div className='flex justify-end'>
              <button className='inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700'>
                <Save className='w-4 h-4' />
                Update Password
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] px-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            <button
              className='p-1.5 mr-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>
            My Profile
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage your profile settings
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className='flex gap-6'>
        {/* Sidebar */}
        <div className='w-64 flex-shrink-0'>
          <div className='bg-white border border-gray-200 rounded-lg p-3 sticky top-6'>
            {[
              { key: 'profile', label: 'Profile', icon: User },
              { key: 'notifications', label: 'Notifications', icon: Bell },
              { key: 'security', label: 'Security', icon: Lock },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as any)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.key
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className='w-5 h-5' />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1'>
          <div className='bg-white border border-gray-200 rounded-lg p-6'>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
