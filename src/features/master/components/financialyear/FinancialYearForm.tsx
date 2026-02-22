import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Calendar, RotateCcw } from 'lucide-react';
import type { FinancialYear } from '../../types';

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

const addMonths = (date: Date, months: number) => {
  const r = new Date(date);
  r.setMonth(r.getMonth() + months);
  return r;
};
const addDays = (date: Date, days: number) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};
const formatDateForInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const calculateDates = (startDateStr: string) => {
  if (!startDateStr) return null;
  const startDate = new Date(startDateStr);
  const endDate = addDays(addMonths(startDate, 12), -1);
  const firstHalfEndDate = addDays(addMonths(startDate, 6), -2);
  const secondHalfStartDate = addDays(firstHalfEndDate, 1);
  return {
    startDate: formatDateForInput(startDate),
    endDate: formatDateForInput(endDate),
    firstHalfStartDate: formatDateForInput(startDate),
    firstHalfEndDate: formatDateForInput(firstHalfEndDate),
    secondHalfStartDate: formatDateForInput(secondHalfStartDate),
    secondHalfEndDate: formatDateForInput(endDate),
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

  React.useEffect(() => {
    if (financialYear) reset(financialYear);
  }, [financialYear, reset]);

  const startDate = watch('startDate');
  React.useEffect(() => {
    if (startDate && mode === 'create') {
      const dates = calculateDates(startDate);
      if (dates) {
        setValue('endDate', dates.endDate);
        setValue('firstHalfStartDate', dates.firstHalfStartDate);
        setValue('firstHalfEndDate', dates.firstHalfEndDate);
        setValue('secondHalfStartDate', dates.secondHalfStartDate);
        setValue('secondHalfEndDate', dates.secondHalfEndDate);
      }
    }
  }, [startDate, mode, setValue]);

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
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
              {mode === 'create'
                ? 'Create Financial Year'
                : 'Edit Financial Year'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {mode === 'create'
                ? 'Add a new financial year'
                : 'Update financial year information'}
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
            form='fy-form'
            disabled={isLoading || !isValid}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
          >
            <Save size={15} />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <form
        id='fy-form'
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-6'
      >
        {/* Financial Year Period */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Calendar size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Financial Year Period
                </h2>
                <p className='text-xs text-gray-500'>
                  Define the start and end dates
                </p>
              </div>
            </div>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Start Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('startDate')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.startDate ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.startDate && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  End Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('endDate')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none'
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* First Half Year */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <h3 className='text-sm font-semibold text-gray-800'>
              First Half Year
            </h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Start Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('firstHalfStartDate')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50'
                  readOnly
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  End Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('firstHalfEndDate')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50'
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second Half Year */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <h3 className='text-sm font-semibold text-gray-800'>
              Second Half Year
            </h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Start Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('secondHalfStartDate')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50'
                  readOnly
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  End Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  {...register('secondHalfEndDate')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50'
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FinancialYearForm;
