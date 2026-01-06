import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  FileText,
  Calendar,
} from 'lucide-react';
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
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
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
              {mode === 'create' ? 'Create Company' : 'Edit Company'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {mode === 'create'
                ? 'Add a new company to the system'
                : 'Update company information'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={handleReset}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading || !isValid}
          >
            {isLoading
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Company'
                : 'Update Company'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Building2 size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Basic Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Company Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                {...register('name')}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder='Enter company name'
              />
              {errors.name && (
                <p className='mt-1.5 text-sm text-red-600'>
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <MapPin size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Address Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address Line 1
                </label>
                <input
                  type='text'
                  {...register('address1')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter address line 1'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Address Line 2
                </label>
                <input
                  type='text'
                  {...register('address2')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Phone size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Contact Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone
                </label>
                <input
                  type='text'
                  {...register('phone')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder='Enter email address'
                />
                {errors.email && (
                  <p className='mt-1.5 text-sm text-red-600'>
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter website URL'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Tax Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <FileText size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Legal & Tax Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  TIN
                </label>
                <input
                  type='text'
                  {...register('tin')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  License End Date
                </label>
                <input
                  type='date'
                  {...register('licenseEndDate')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
