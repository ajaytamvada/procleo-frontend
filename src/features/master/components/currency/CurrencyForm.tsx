import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Coins, RotateCcw } from 'lucide-react';
import type { Currency } from '../../types';

const currencySchema = z.object({
  name: z
    .string()
    .min(1, 'Currency name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  code: z
    .string()
    .min(1, 'Currency code is required')
    .max(100, 'Code cannot exceed 100 characters'),
  symbol: z
    .string()
    .max(10, 'Symbol cannot exceed 10 characters')
    .optional()
    .or(z.literal('')),
  remarks: z
    .string()
    .max(500, 'Remarks cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
  currency?: Currency;
  onSubmit: (data: CurrencyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const CurrencyForm: React.FC<CurrencyFormProps> = ({
  currency,
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
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: currency || {},
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (currency) reset(currency);
  }, [currency, reset]);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200'
            disabled={isLoading}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {mode === 'create' ? 'Create Currency' : 'Edit Currency'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {mode === 'create'
                ? 'Add a new currency'
                : 'Update currency information'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => reset()}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50'
            disabled={isLoading}
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            type='submit'
            form='currency-form'
            disabled={isLoading || !isValid}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
          >
            <Save size={15} />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='currency-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Coins size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Currency Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the currency details below
                </p>
              </div>
            </div>
          </div>

          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Currency Name <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='e.g., US Dollar'
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Currency Code <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('code')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase ${errors.code ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='e.g., USD'
                  disabled={isLoading}
                />
                {errors.code && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.code.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Currency Symbol
                </label>
                <input
                  {...register('symbol')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='e.g., $'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Remarks
              </label>
              <textarea
                {...register('remarks')}
                rows={3}
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none'
                placeholder='Enter any additional remarks'
                disabled={isLoading}
              />
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading || !isValid}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-gray-400'
            >
              <Save size={15} />
              {isLoading
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create Currency'
                  : 'Update Currency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurrencyForm;
