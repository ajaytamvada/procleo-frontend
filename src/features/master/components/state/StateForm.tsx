import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Map } from 'lucide-react';
import type { State } from '../../hooks/useStateAPI';
import { useCountries } from '../../hooks/useCountryAPI';

const stateSchema = z.object({
  countryId: z.number().min(1, 'Country is required'),
  name: z
    .string()
    .min(1, 'State name is required')
    .max(255, 'State name cannot exceed 255 characters'),
  code: z
    .string()
    .min(1, 'State code is required')
    .max(50, 'State code cannot exceed 50 characters'),
});

type StateFormData = z.infer<typeof stateSchema>;

interface StateFormProps {
  state?: State;
  onSubmit: (data: StateFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const StateForm: React.FC<StateFormProps> = ({
  state,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { data: countries = [] } = useCountries();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StateFormData>({
    resolver: zodResolver(stateSchema),
    defaultValues: state || {
      countryId: 0,
      name: '',
      code: '',
    },
  });

  React.useEffect(() => {
    if (state) {
      reset(state);
    }
  }, [state, reset]);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition-colors'
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {state?.id ? 'Edit State' : 'New State'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {state?.id ? 'Update state details' : 'Create a new state record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='state-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='state-form' onSubmit={handleSubmit(onSubmit)}>
          {/* Form Header */}
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Map size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  State Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the state details below
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* Country Selection */}
              <div className='md:col-span-2'>
                <label
                  htmlFor='countryId'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Country <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('countryId', { valueAsNumber: true })}
                  id='countryId'
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.countryId ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value={0}>Select a country</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.countryId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.countryId.message}
                  </p>
                )}
              </div>

              {/* State Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  State Name <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  type='text'
                  id='name'
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter state name (e.g., California, Maharashtra)'
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* State Code */}
              <div>
                <label
                  htmlFor='code'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  State Code <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('code')}
                  type='text'
                  id='code'
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.code ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter state code (e.g., CA, MH)'
                  disabled={isSubmitting}
                />
                {errors.code && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              <Save size={15} />
              {isSubmitting ? 'Saving...' : state?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StateForm;
