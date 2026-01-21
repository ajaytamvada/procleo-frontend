import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Building2, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Verify path
import { Input } from '@/components/ui/Input'; // Verify path
// If Input/Button components not found at this exact path, standard HTML elements will work too, but trying to match project style.
// Assuming ShadCN-like or custom components exist based on previous file views.

interface VendorProfile {
  name: string;
  code: string;
  phone: string;
  mobileNo: string;
  webLink: string;
  gst: string;
  pan: string;
  address1: string;
  address2: string;
  state: string;
  pinCode: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactDesignation: string;
}

const VendorProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorProfile>();

  // Fetch Profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vendor', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('/api/vendor-portal/profile');
      return response.data;
    },
  });

  // Update Profile Mutation
  const mutation = useMutation({
    mutationFn: async (data: VendorProfile) => {
      // Mapping form fields to DTO structure expected by backend
      const payload = {
        companyName: data.name, // Name usually read-only but might be sent
        phone: data.phone,
        mobile: data.mobileNo,
        website: data.webLink,
        address1: data.address1,
        address2: data.address2,
        state: data.state,
        pinCode: data.pinCode,
        gst: data.gst,
        pan: data.pan,
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactDesignation: data.contactDesignation,
      };

      const response = await apiClient.put(
        '/api/vendor-portal/profile',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      alert('Profile updated successfully!'); // Replace with toast if available
      queryClient.invalidateQueries({ queryKey: ['vendor', 'profile'] });
    },
    onError: (err: any) => {
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6 pb-10'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Company Profile</h1>
          <p className='text-gray-500 mt-1'>
            Manage your company information and contact details
          </p>
        </div>
        <Button
          onClick={handleSubmit(data => mutation.mutate(data))}
          disabled={mutation.isPending}
          className='bg-purple-600 hover:bg-purple-700 text-white'
        >
          {mutation.isPending ? (
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          ) : (
            <Save className='w-4 h-4 mr-2' />
          )}
          Save Changes
        </Button>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          <Building2 className='w-5 h-5 text-purple-600' />
          Company Details
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Company Name
            </label>
            <input
              {...register('name')}
              disabled
              className='w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Vendor Code
            </label>
            <input
              {...register('code')}
              disabled
              className='w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              GST Number
            </label>
            <input
              {...register('gst')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              PAN Number
            </label>
            <input
              {...register('pan')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Website
            </label>
            <input
              {...register('webLink')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Address Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Address Line 1
            </label>
            <input
              {...register('address1')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Address Line 2
            </label>
            <input
              {...register('address2')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              State
            </label>
            <input
              {...register('state')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              PIN Code
            </label>
            <input
              {...register('pinCode')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Contact Person
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              First Name
            </label>
            <input
              {...register('contactFirstName')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Last Name
            </label>
            <input
              {...register('contactLastName')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              {...register('contactEmail')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Phone
            </label>
            <input
              {...register('contactPhone')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Designation
            </label>
            <input
              {...register('contactDesignation')}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
