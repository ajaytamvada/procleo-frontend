import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { FinancialYear } from '../../types';

// Validation schema
const financialYearSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  firstHalfStartDate: z.string().min(1, 'First half start date is required'),
  firstHalfEndDate: z.string().min(1, 'First half end date is required'),
  secondHalfStartDate: z.string().min(1, 'Second half start date is required'),
  secondHalfEndDate: z.string().min(1, 'Second half end date is required'),
});

type FinancialYearFormData = z.infer<typeof financialYearSchema>;

interface FinancialYearFormProps {
  financialYear?: FinancialYear;
  onSubmit: (data: FinancialYearFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

// Date calculation helper functions
const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateDates = (startDateStr: string) => {
  if (!startDateStr) return null;

  const startDate = new Date(startDateStr);

  // First Half Start Date = Start Date
  const firstHalfStartDate = startDate;

  // End Date = Start Date + 12 months - 1 day
  const endDate = addDays(addMonths(startDate, 12), -1);

  // First Half End Date = Start Date + 6 months - 2 days
  const firstHalfEndDate = addDays(addMonths(startDate, 6), -2);

  // Second Half Start Date = First Half End Date + 1 day
  const secondHalfStartDate = addDays(firstHalfEndDate, 1);

  // Second Half End Date = End Date
  const secondHalfEndDate = endDate;

  return {
    startDate: formatDateForInput(startDate),
    endDate: formatDateForInput(endDate),
    firstHalfStartDate: formatDateForInput(firstHalfStartDate),
    firstHalfEndDate: formatDateForInput(firstHalfEndDate),
    secondHalfStartDate: formatDateForInput(secondHalfStartDate),
    secondHalfEndDate: formatDateForInput(secondHalfEndDate),
  };
};

const FinancialYearForm: React.FC<FinancialYearFormProps> = ({
  financialYear,
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
    setValue,
    watch,
  } = useForm<FinancialYearFormData>({
    resolver: zodResolver(financialYearSchema),
    defaultValues: financialYear || {},
    mode: 'onChange',
  });

  // Update form when financial year data changes
  React.useEffect(() => {
    if (financialYear) {
      reset(financialYear);
    }
  }, [financialYear, reset]);

  // Watch for start date changes and calculate other dates
  const startDate = watch('startDate');

  React.useEffect(() => {
    if (startDate && mode === 'create') {
      const calculatedDates = calculateDates(startDate);
      if (calculatedDates) {
        setValue('endDate', calculatedDates.endDate);
        setValue('firstHalfStartDate', calculatedDates.firstHalfStartDate);
        setValue('firstHalfEndDate', calculatedDates.firstHalfEndDate);
        setValue('secondHalfStartDate', calculatedDates.secondHalfStartDate);
        setValue('secondHalfEndDate', calculatedDates.secondHalfEndDate);
      }
    }
  }, [startDate, mode, setValue]);

  const handleFormSubmit = (data: FinancialYearFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6 max-w-4xl'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {mode === 'create' ? 'Create Financial Year' : 'Edit Financial Year'}
        </h2>
        <p className='text-sm text-gray-600 mt-1'>
          {mode === 'create'
            ? 'Add a new financial year to the system'
            : 'Update financial year information'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
        {/* Financial Year Period */}
        <div className='border-b pb-4'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Financial Year Period
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Start Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('startDate')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                End Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('endDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                readOnly
              />
              {errors.endDate && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* First Half Year */}
        <div className='border-b pb-4'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            First Half Year
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Start Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('firstHalfStartDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                readOnly
              />
              {errors.firstHalfStartDate && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.firstHalfStartDate.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                End Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('firstHalfEndDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                readOnly
              />
              {errors.firstHalfEndDate && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.firstHalfEndDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Second Half Year */}
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Second Half Year
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Start Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('secondHalfStartDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                readOnly
              />
              {errors.secondHalfStartDate && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.secondHalfStartDate.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                End Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                {...register('secondHalfEndDate')}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                readOnly
              />
              {errors.secondHalfEndDate && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.secondHalfEndDate.message}
                </p>
              )}
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
                ? 'Create Financial Year'
                : 'Update Financial Year'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinancialYearForm;
