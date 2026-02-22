import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Receipt } from 'lucide-react';
import type { Tax } from '../../hooks/useTaxAPI';

const taxSchema = z.object({
  primaryTaxName: z
    .string()
    .min(1, 'Primary tax name is required')
    .max(500, 'Cannot exceed 500 characters'),
  secondaryTaxName: z
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  primaryTaxPercentage: z
    .number()
    .min(0, 'Must be >= 0')
    .max(100, 'Must be <= 100')
    .optional(),
  secondaryTaxPercentage: z
    .number()
    .min(0, 'Must be >= 0')
    .max(100, 'Must be <= 100')
    .optional(),
  taxCode: z
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  purchaseOrderType: z
    .string()
    .max(50, 'Cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  active: z.boolean().optional(),
  remarks: z
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type TaxFormData = z.infer<typeof taxSchema>;

interface TaxFormProps {
  tax?: Tax;
  onSubmit: (data: TaxFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaxForm: React.FC<TaxFormProps> = ({
  tax,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: tax || {
      primaryTaxName: '',
      secondaryTaxName: '',
      primaryTaxPercentage: 0,
      secondaryTaxPercentage: 0,
      taxCode: '',
      purchaseOrderType: '',
      active: true,
      remarks: '',
    },
  });

  React.useEffect(() => {
    if (tax) reset(tax);
  }, [tax, reset]);

  const primaryPct = watch('primaryTaxPercentage') || 0;
  const secondaryPct = watch('secondaryTaxPercentage') || 0;
  const totalTax = Number(primaryPct) + Number(secondaryPct);

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
              {tax?.id ? 'Edit Tax' : 'New Tax'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {tax?.id ? 'Update tax details' : 'Create a new tax record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='tax-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='tax-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Receipt size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Tax Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the tax details below
                </p>
              </div>
            </div>
          </div>

          <div className='p-6 space-y-5'>
            {/* Primary Tax */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Primary Tax Name <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('primaryTaxName')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.primaryTaxName ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='e.g., GST, VAT'
                  disabled={isSubmitting}
                />
                {errors.primaryTaxName && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.primaryTaxName.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Primary Tax Percentage (%)
                </label>
                <input
                  {...register('primaryTaxPercentage', { valueAsNumber: true })}
                  type='number'
                  step='0.01'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='0.00'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Secondary Tax */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Secondary Tax Name
                </label>
                <input
                  {...register('secondaryTaxName')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter secondary tax name (optional)'
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Secondary Tax Percentage (%)
                </label>
                <input
                  {...register('secondaryTaxPercentage', {
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='0.00'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Total Tax Display */}
            <div className='p-4 bg-violet-50 border border-violet-200 rounded-lg'>
              <p className='text-sm font-medium text-gray-700'>
                Total Tax Percentage:{' '}
                <span className='text-xl font-bold text-violet-600'>
                  {totalTax.toFixed(2)}%
                </span>
              </p>
            </div>

            {/* Tax Code and PO Type */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Tax Code
                </label>
                <input
                  {...register('taxCode')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter tax code'
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Purchase Order Type
                </label>
                <input
                  {...register('purchaseOrderType')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter PO type'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Remarks
              </label>
              <textarea
                {...register('remarks')}
                rows={3}
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none'
                placeholder='Enter remarks'
                disabled={isSubmitting}
              />
            </div>

            {/* Active Checkbox */}
            <div className='flex items-center gap-2'>
              <input
                {...register('active')}
                type='checkbox'
                id='active'
                className='h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded'
                disabled={isSubmitting}
              />
              <label htmlFor='active' className='text-sm text-gray-700'>
                Active
              </label>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-gray-400'
            >
              <Save size={15} />
              {isSubmitting ? 'Saving...' : tax?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxForm;
