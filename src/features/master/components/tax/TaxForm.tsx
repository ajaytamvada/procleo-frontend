import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
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
    if (tax) {
      reset(tax);
    }
  }, [tax, reset]);

  const primaryTaxPercentage = watch('primaryTaxPercentage') || 0;
  const secondaryTaxPercentage = watch('secondaryTaxPercentage') || 0;
  const totalTax =
    Number(primaryTaxPercentage) + Number(secondaryTaxPercentage);

  return (
    <div className='bg-white rounded-lg shadow-md'>
      <div className='border-b border-gray-200 p-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='text-gray-600 hover:text-gray-800 transition-colors'
            disabled={isSubmitting}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className='text-2xl font-bold text-gray-800'>
            {tax?.id ? 'Edit Tax' : 'New Tax'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='p-6'>
        <div className='space-y-6 max-w-4xl'>
          {/* Primary Tax Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='primaryTaxName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Primary Tax Name <span className='text-red-500'>*</span>
              </label>
              <input
                {...register('primaryTaxName')}
                type='text'
                id='primaryTaxName'
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.primaryTaxName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter primary tax name (e.g., GST, VAT)'
                disabled={isSubmitting}
              />
              {errors.primaryTaxName && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.primaryTaxName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='primaryTaxPercentage'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Primary Tax Percentage (%)
              </label>
              <input
                {...register('primaryTaxPercentage', { valueAsNumber: true })}
                type='number'
                step='0.01'
                id='primaryTaxPercentage'
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.primaryTaxPercentage
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='0.00'
                disabled={isSubmitting}
              />
              {errors.primaryTaxPercentage && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.primaryTaxPercentage.message}
                </p>
              )}
            </div>
          </div>

          {/* Secondary Tax Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='secondaryTaxName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Secondary Tax Name
              </label>
              <input
                {...register('secondaryTaxName')}
                type='text'
                id='secondaryTaxName'
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.secondaryTaxName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter secondary tax name (optional)'
                disabled={isSubmitting}
              />
              {errors.secondaryTaxName && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.secondaryTaxName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='secondaryTaxPercentage'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Secondary Tax Percentage (%)
              </label>
              <input
                {...register('secondaryTaxPercentage', { valueAsNumber: true })}
                type='number'
                step='0.01'
                id='secondaryTaxPercentage'
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.secondaryTaxPercentage
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='0.00'
                disabled={isSubmitting}
              />
              {errors.secondaryTaxPercentage && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.secondaryTaxPercentage.message}
                </p>
              )}
            </div>
          </div>

          {/* Total Tax Display */}
          <div className='bg-blue-50 p-4 rounded-lg'>
            <p className='text-sm font-medium text-gray-700'>
              Total Tax Percentage:{' '}
              <span className='text-xl font-bold text-blue-600'>
                {totalTax.toFixed(2)}%
              </span>
            </p>
          </div>

          {/* Tax Code and PO Type */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='taxCode'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Tax Code
              </label>
              <input
                {...register('taxCode')}
                type='text'
                id='taxCode'
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.taxCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter tax code'
                disabled={isSubmitting}
              />
              {errors.taxCode && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.taxCode.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='purchaseOrderType'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Purchase Order Type
              </label>
              <input
                {...register('purchaseOrderType')}
                type='text'
                id='purchaseOrderType'
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.purchaseOrderType
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='Enter PO type'
                disabled={isSubmitting}
              />
              {errors.purchaseOrderType && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.purchaseOrderType.message}
                </p>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor='remarks'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Remarks
            </label>
            <textarea
              {...register('remarks')}
              id='remarks'
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.remarks ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Enter remarks'
              disabled={isSubmitting}
            />
            {errors.remarks && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.remarks.message}
              </p>
            )}
          </div>

          {/* Active Checkbox */}
          <div className='flex items-center'>
            <input
              {...register('active')}
              type='checkbox'
              id='active'
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              disabled={isSubmitting}
            />
            <label
              htmlFor='active'
              className='ml-2 block text-sm text-gray-700'
            >
              Active
            </label>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-4 pt-4'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              <Save size={20} />
              <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaxForm;
