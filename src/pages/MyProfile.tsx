import React, { useState, useEffect } from 'react';
import { User as UserIcon, Bell, Lock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUpdateProfile, useUpdatePassword } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const MyProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'notifications' | 'security'
  >('profile');
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || user?.departmentName || '',
      designation: user?.designation || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || user.departmentName || '',
        designation: user.designation || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = (data: any) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        // Toast is handled in hook
      },
    });
  };

  const onPasswordSubmit = (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    updatePasswordMutation.mutate(data, {
      onSuccess: () => {
        resetPassword();
      },
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none';
  const errorClass = 'text-red-500 text-xs mt-1';

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form
            className='space-y-8'
            onSubmit={handleSubmitProfile(onProfileSubmit)}
          >
            {/* Profile Picture */}
            <div className='flex items-center gap-6 pb-6 border-b border-gray-100'>
              <div className='relative'>
                <div className='w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold'>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
                {/* <button type="button" className='absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 shadow'>
                  <Camera className='w-4 h-4' />
                </button> */}
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className='text-sm text-gray-500'>
                  {user?.designation}{' '}
                  {user?.designation && user?.departmentName ? '•' : ''}{' '}
                  {user?.departmentName}
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
                  {...registerProfile('firstName', {
                    required: 'First name is required',
                  })}
                  className={inputClass}
                />
                {profileErrors.firstName && (
                  <p className={errorClass}>
                    {profileErrors.firstName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Last Name
                </label>
                <input
                  {...registerProfile('lastName', {
                    required: 'Last name is required',
                  })}
                  className={inputClass}
                />
                {profileErrors.lastName && (
                  <p className={errorClass}>
                    {profileErrors.lastName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  {...registerProfile('email', {
                    required: 'Email is required',
                  })}
                  className={inputClass}
                />
                {profileErrors.email && (
                  <p className={errorClass}>
                    {profileErrors.email.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Phone
                </label>
                <input {...registerProfile('phone')} className={inputClass} />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Department
                </label>
                <input
                  disabled
                  {...registerProfile('department')}
                  className={`${inputClass} bg-gray-50`}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Designation
                </label>
                <input
                  disabled
                  {...registerProfile('designation')}
                  className={`${inputClass} bg-gray-50`}
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={updateProfileMutation.isPending}
                className='inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50'
              >
                <Save className='w-4 h-4' />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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
          <form
            className='space-y-6 max-w-xl'
            onSubmit={handleSubmitPassword(onPasswordSubmit)}
          >
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Current Password
              </label>
              <input
                type='password'
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
                className={inputClass}
              />
              {passwordErrors.currentPassword && (
                <p className={errorClass}>
                  {passwordErrors.currentPassword.message as string}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                New Password
              </label>
              <input
                type='password'
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={inputClass}
              />
              {passwordErrors.newPassword && (
                <p className={errorClass}>
                  {passwordErrors.newPassword.message as string}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Confirm New Password
              </label>
              <input
                type='password'
                {...registerPassword('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (val: string) => {
                    if (watchPassword && val !== watchPassword('newPassword')) {
                      return 'Passwords do not match';
                    }
                  },
                })}
                className={inputClass}
              />
              {passwordErrors.confirmPassword && (
                <p className={errorClass}>
                  {passwordErrors.confirmPassword.message as string}
                </p>
              )}
            </div>

            <div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Password Requirements
              </p>
              <ul className='text-sm text-gray-600 list-disc list-inside space-y-1'>
                <li>Minimum 6 characters</li>
                <li>Upper & lowercase letters</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>

            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={updatePasswordMutation.isPending}
                className='inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50'
              >
                <Save className='w-4 h-4' />
                {updatePasswordMutation.isPending
                  ? 'Updating...'
                  : 'Update Password'}
              </button>
            </div>
          </form>
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
              { key: 'profile', label: 'Profile', icon: UserIcon },
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
