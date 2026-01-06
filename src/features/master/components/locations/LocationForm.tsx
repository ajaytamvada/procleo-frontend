import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, MapPin, Building2 } from 'lucide-react';
import type { Location } from '../../hooks/useLocationAPI';

// Validation schema
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
    if (location) {
      reset(location);
    }
  }, [location, reset]);

  const handleFormSubmit = (data: LocationFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    if (location) {
      reset(location);
    } else {
      reset({});
    }
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-6'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onCancel}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} />
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
            onClick={handleReset}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Update Location'
                : 'Create Location'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <MapPin size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Basic Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Location Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('name')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder='Enter location name'
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-600'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Location Code
                </label>
                <input
                  type='text'
                  {...register('code')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter location code'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Building2 size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Address Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                  placeholder='Enter full address'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  City
                </label>
                <input
                  type='text'
                  {...register('city')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter city'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  State
                </label>
                <input
                  type='text'
                  {...register('state')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter state'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Country
                </label>
                <input
                  type='text'
                  {...register('country')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter country'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  PIN Code
                </label>
                <input
                  type='text'
                  {...register('pinCode')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter PIN code'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks
                </label>
                <textarea
                  {...register('remarks')}
                  rows={3}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                  placeholder='Enter any additional remarks'
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
