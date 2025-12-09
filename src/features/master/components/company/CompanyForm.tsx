import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Company } from '../../types';

// Validation schema
const companySchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(80, 'Name cannot exceed 80 characters'),
  address1: z
    .string()
    .max(180, 'Address 1 cannot exceed 180 characters')
    .optional()
    .or(z.literal('')),
  address2: z
    .string()
    .max(180, 'Address 2 cannot exceed 180 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(90, 'City cannot exceed 90 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(50, 'State cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(90, 'Country cannot exceed 90 characters')
    .optional()
    .or(z.literal('')),
  pinCode: z
    .string()
    .max(50, 'PIN code cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(50, 'Phone cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  fax: z
    .string()
    .max(50, 'Fax cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .max(200, 'Website cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  tin: z
    .string()
    .max(50, 'TIN cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  pan: z
    .string()
    .max(50, 'PAN cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  cin: z
    .string()
    .max(50, 'CIN cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  cst: z
    .string()
    .max(50, 'CST/GST cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  assetPrefix: z
    .string()
    .max(50, 'Asset prefix cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  licenseNumber: z
    .string()
    .max(100, 'License number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  licenceDate: z.string().optional().or(z.literal('')),
  licenseEndDate: z.string().optional().or(z.literal('')),
  fileName: z
    .string()
    .max(500, 'File name cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: company || {},
    mode: 'onChange',
  });

  // Update form when company data changes
  React.useEffect(() => {
    if (company) {
      reset(company);
    }
  }, [company, reset]);

  const handleFormSubmit = (data: CompanyFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    if (company) {
      reset(company);
    } else {
      reset({});
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {mode === 'create' ? 'Create Company' : 'Edit Company'}
        </h2>
        <p className='text-sm text-gray-600 mt-1'>
          {mode === 'create'
            ? 'Add a new company to the system'
            : 'Update company information'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
        {/* Basic Information */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Company Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            {...register('name')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder='Enter company name'
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
          )}
        </div>

        {/* Address Information */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Address Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Address Line 1
              </label>
              <input
                type='text'
                {...register('address1')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter address line 1'
              />
              {errors.address1 && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.address1.message}
                </p>
              )}
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Address Line 2
              </label>
              <input
                type='text'
                {...register('address2')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter address line 2'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                City
              </label>
              <input
                type='text'
                {...register('city')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter PIN code'
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Contact Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Phone
              </label>
              <input
                type='text'
                {...register('phone')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter phone number'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Fax
              </label>
              <input
                type='text'
                {...register('fax')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter fax number'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email
              </label>
              <input
                type='email'
                {...register('email')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='Enter email address'
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Website
              </label>
              <input
                type='text'
                {...register('website')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter website URL'
              />
            </div>
          </div>
        </div>

        {/* Legal & Tax Information */}
        <div className='border-t pt-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Legal & Tax Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                TIN
              </label>
              <input
                type='text'
                {...register('tin')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter TIN'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                PAN
              </label>
              <input
                type='text'
                {...register('pan')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter PAN'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                CIN
              </label>
              <input
                type='text'
                {...register('cin')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter CIN'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                CST/GST Number
              </label>
              <input
                type='text'
                {...register('cst')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter CST/GST number'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Asset Prefix
              </label>
              <input
                type='text'
                {...register('assetPrefix')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter asset prefix'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                License Number
              </label>
              <input
                type='text'
                {...register('licenseNumber')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter license number'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                License Start Date
              </label>
              <input
                type='date'
                {...register('licenceDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                License End Date
              </label>
              <input
                type='date'
                {...register('licenseEndDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='border-t pt-6 flex justify-end space-x-4'>
          <button
            type='button'
            onClick={handleReset}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500'
            disabled={isLoading}
          >
            Reset
          </button>

          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500'
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type='submit'
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading || !isValid}
          >
            {isLoading
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Company'
                : 'Update Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
