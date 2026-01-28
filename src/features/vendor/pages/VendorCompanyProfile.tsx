import React, { useState } from 'react';
import { Building, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

const useVendorProfile = () => {
  return useQuery({
    queryKey: ['vendor', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/vendor-portal/profile');
      return response.data;
    },
  });
};

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put('/vendor-portal/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    },
  });
};

const VendorCompanyProfile: React.FC = () => {
  const { data: profile, isLoading } = useVendorProfile();
  const updateMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Map fields to DTO if necessary, but DTO seems to match mostly
    const dto = {
      phone: formData.phone,
      mobile: formData.mobileNo, // Mapping mobileNo to mobile in DTO
      website: formData.webLink, // Mapping webLink to website in DTO
      address1: formData.address1,
      address2: formData.address2,
      state: formData.state,
      pinCode: formData.pinCode,
      contactFirstName: formData.contactFirstName,
      contactLastName: formData.contactLastName,
      contactDesignation: formData.contactDesignation,
      contactPhone: formData.contactPhone,
      gst: formData.gst,
      pan: formData.pan,
    };
    updateMutation.mutate(dto);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600'></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Company Profile</h1>
          <p className='text-gray-500 mt-1'>
            Manage your company information and contact details
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setFormData(profile); // Reset
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isEditing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 lg:grid-cols-3 gap-6'
      >
        {/* Basic Info Card */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc] flex items-center gap-2'>
              <Building className='w-5 h-5 text-gray-400' />
              <h2 className='text-base font-semibold text-gray-900'>
                Company Details
              </h2>
            </div>
            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Company Name
                </label>
                <div className='px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-600'>
                  {profile.name}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Code
                </label>
                <div className='px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-600'>
                  {profile.code}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Website
                </label>
                {isEditing ? (
                  <input
                    type='url'
                    value={formData.webLink || ''}
                    onChange={e =>
                      setFormData({ ...formData, webLink: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='flex items-center gap-2 text-gray-900'>
                    <Globe className='w-4 h-4 text-gray-400' />
                    {profile.webLink || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc] flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-gray-400' />
              <h2 className='text-base font-semibold text-gray-900'>
                Address Information
              </h2>
            </div>
            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address Line 1
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.address1 || ''}
                    onChange={e =>
                      setFormData({ ...formData, address1: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>{profile.address1 || '-'}</div>
                )}
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address Line 2
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.address2 || ''}
                    onChange={e =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>{profile.address2 || '-'}</div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  State
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.state || ''}
                    onChange={e =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>{profile.state || '-'}</div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pin Code
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.pinCode || ''}
                    onChange={e =>
                      setFormData({ ...formData, pinCode: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>{profile.pinCode || '-'}</div>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc] flex items-center gap-2'>
              <Phone className='w-5 h-5 text-gray-400' />
              <h2 className='text-base font-semibold text-gray-900'>
                Contact Person
              </h2>
            </div>
            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.contactFirstName || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        contactFirstName: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>
                    {profile.contactFirstName || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.contactLastName || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        contactLastName: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>
                    {profile.contactLastName || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Designation
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.contactDesignation || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        contactDesignation: e.target.value,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>
                    {profile.contactDesignation || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.contactPhone || ''}
                    onChange={e =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-gray-900'>
                    {profile.contactPhone || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className='space-y-6'>
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc] flex items-center gap-2'>
              <CreditCard className='w-5 h-5 text-gray-400' />
              <h2 className='text-base font-semibold text-gray-900'>
                Tax & Statutory
              </h2>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  GST Number
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.gst || ''}
                    onChange={e =>
                      setFormData({ ...formData, gst: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-sm text-gray-900 font-medium font-mono'>
                    {profile.gst || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  PAN Number
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.pan || ''}
                    onChange={e =>
                      setFormData({ ...formData, pan: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='text-sm text-gray-900 font-medium font-mono'>
                    {profile.pan || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc] flex items-center gap-2'>
              <Mail className='w-5 h-5 text-gray-400' />
              <h2 className='text-base font-semibold text-gray-900'>
                Communication
              </h2>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Primary Email
                </label>
                <div className='flex items-center gap-2 text-gray-900'>
                  <Mail className='w-4 h-4 text-gray-400' />
                  {profile.mailId || '-'}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.phone || ''}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='flex items-center gap-2 text-gray-900'>
                    <Phone className='w-4 h-4 text-gray-400' />
                    {profile.phone || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Mobile
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.mobileNo || ''}
                    onChange={e =>
                      setFormData({ ...formData, mobileNo: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  />
                ) : (
                  <div className='flex items-center gap-2 text-gray-900'>
                    <Phone className='w-4 h-4 text-gray-400' />
                    {profile.mobileNo || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className='lg:col-span-3 flex justify-end gap-3'>
            <button
              type='button'
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
              }}
              className='px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={updateMutation.isPending}
              className='px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700'
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default VendorCompanyProfile;
