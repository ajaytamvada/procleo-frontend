import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, MapPin, Building2, RotateCcw } from 'lucide-react';
import type { Location } from '../../hooks/useLocationAPI';

const locationSchema = z.object({
  name: z
    .string()
    .min(1, 'Location name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  code: z
    .string()
    .max(50, 'Code cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'Address cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(100, 'Country cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  pinCode: z
    .string()
    .max(20, 'PIN code cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
  remarks: z
    .string()
    .max(500, 'Remarks cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: LocationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditMode = !!location?.id;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location || {},
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (location) reset(location);
  }, [location, reset]);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200'
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {isEditMode ? 'Edit Location' : 'Create Location'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {isEditMode
                ? 'Update location information'
                : 'Add a new location to the system'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => reset(location || {})}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50'
            disabled={isSubmitting}
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            type='submit'
            form='location-form'
            disabled={isSubmitting || !isValid}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
          >
            <Save size={15} />
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <form
        id='location-form'
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
      >
        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <MapPin size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Basic Information
                </h2>
                <p className='text-xs text-gray-500'>Location name and code</p>
              </div>
            </div>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Location Name <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='Enter location name'
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Location Code
                </label>
                <input
                  {...register('code')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter location code'
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Building2 size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Address Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Location address details
                </p>
              </div>
            </div>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Address
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none'
                  placeholder='Enter full address'
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  City
                </label>
                <input
                  {...register('city')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter city'
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  State
                </label>
                <input
                  {...register('state')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter state'
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Country
                </label>
                <input
                  {...register('country')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter country'
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  PIN Code
                </label>
                <input
                  {...register('pinCode')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter PIN code'
                  disabled={isSubmitting}
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Remarks
                </label>
                <textarea
                  {...register('remarks')}
                  rows={3}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none'
                  placeholder='Enter any additional remarks'
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;
