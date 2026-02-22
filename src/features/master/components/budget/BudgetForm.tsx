import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Save,
  Wallet,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import type { Budget } from '../../types';
import { useAllFinancialYears } from '../../hooks/useFinancialYearAPI';
import { useDepartmentsList } from '../../hooks/useDepartmentAPI';

const budgetSchema = z.object({
  financialYearId: z.number().min(1, 'Financial year is required'),
  departmentId: z.string().min(1, 'Department is required'),
  annualBudget: z.number().positive('Annual budget must be greater than zero'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (data: BudgetFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || {},
    mode: 'onChange',
  });

  const { data: financialYears = [], isLoading: loadingFY } =
    useAllFinancialYears();
  const { data: departments = [], isLoading: loadingDepts } =
    useDepartmentsList();

  React.useEffect(() => {
    if (budget) reset(budget);
  }, [budget, reset]);

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
              {mode === 'create' ? 'Create Budget' : 'Edit Budget'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {mode === 'create'
                ? 'Add a new budget'
                : 'Update budget information'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => reset(budget || {})}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50'
            disabled={isLoading}
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            type='submit'
            form='budget-form'
            disabled={isLoading || !isValid}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
          >
            <Save size={15} />
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='budget-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Wallet size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Budget Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the budget details below
                </p>
              </div>
            </div>
          </div>

          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Financial Year <span className='text-red-500'>*</span>
                </label>
                <Controller
                  name='financialYearId'
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                      value={field.value || ''}
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.financialYearId ? 'border-red-500' : 'border-gray-200'}`}
                      disabled={loadingFY || mode === 'edit'}
                    >
                      <option value=''>Select Financial Year</option>
                      {financialYears.map(fy => (
                        <option key={fy.id} value={fy.id}>
                          {fy.startDate} - {fy.endDate}
                          {fy.activeYear === 1 ? ' (Active)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.financialYearId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.financialYearId.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Department <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('departmentId')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.departmentId ? 'border-red-500' : 'border-gray-200'}`}
                  disabled={loadingDepts || mode === 'edit'}
                >
                  <option value=''>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.departmentId.message}
                  </p>
                )}
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Annual Budget <span className='text-red-500'>*</span>
                </label>
                <Controller
                  name='annualBudget'
                  control={control}
                  render={({ field }) => (
                    <input
                      type='number'
                      step='0.01'
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      value={field.value || ''}
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.annualBudget ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder='Enter annual budget amount'
                    />
                  )}
                />
                {errors.annualBudget && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.annualBudget.message}
                  </p>
                )}
              </div>
            </div>

            {mode === 'edit' && (
              <div className='flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
                <AlertTriangle size={18} className='text-amber-600 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-amber-800'>Note</p>
                  <p className='text-sm text-amber-700'>
                    Financial Year and Department cannot be changed when
                    editing. Only the Annual Budget amount can be updated.
                  </p>
                </div>
              </div>
            )}
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
                  ? 'Create Budget'
                  : 'Update Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
