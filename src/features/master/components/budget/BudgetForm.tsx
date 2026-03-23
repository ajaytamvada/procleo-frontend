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
  Activity,
  CheckCircle2,
  Clock,
  TrendingDown,
} from 'lucide-react';
import type { Budget } from '../../types';
import { useAllFinancialYears } from '../../hooks/useFinancialYearAPI';
import { useDepartmentsList } from '../../hooks/useDepartmentAPI';

const budgetSchema = z.object({
  financialYearId: z.number().min(1, 'Financial year is required'),
  departmentId: z.number().min(1, 'Department is required'),
  annualBudget: z.number().positive('Annual budget must be greater than zero'),
  isActive: z.boolean().default(true),
  remarks: z.string().optional(),
});

type BudgetFormData = z.output<typeof budgetSchema>;

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
    watch,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget
      ? {
          financialYearId: budget.financialYearId,
          departmentId: budget.departmentId,
          annualBudget: budget.annualBudget,
          isActive: budget.isActive ?? true,
        }
      : {
          isActive: true,
        },
    mode: 'onChange',
  });

  const { data: financialYears = [], isLoading: loadingFY } =
    useAllFinancialYears();
  const { data: departments = [], isLoading: loadingDepts } =
    useDepartmentsList();

  const annualBudget = watch('annualBudget');
  const availableAmount = budget?.availableAmount ?? (annualBudget || 0);
  const utilizationRate = budget?.annualBudget
    ? ((budget.annualBudget - (budget.availableAmount || 0)) /
        budget.annualBudget) *
      100
    : 0;

  const formatCurrency = (amount: number = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  React.useEffect(() => {
    if (budget) {
      reset({
        financialYearId: budget.financialYearId,
        departmentId: budget.departmentId,
        annualBudget: budget.annualBudget,
        isActive: budget.isActive ?? true,
      });
    }
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
                : 'Update budget information and track utilization'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => reset(budget || { isActive: true })}
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
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
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
                      Set allocation for department and year
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
                    <Controller
                      name='departmentId'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                          value={field.value || ''}
                          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.departmentId ? 'border-red-500' : 'border-gray-200'}`}
                          disabled={loadingDepts || mode === 'edit'}
                        >
                          <option value=''>Select Department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.departmentId && (
                      <p className='mt-1.5 text-sm text-red-500'>
                        {errors.departmentId.message}
                      </p>
                    )}
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                      Annual Budget Amount{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                      name='annualBudget'
                      control={control}
                      render={({ field }) => (
                        <div className='relative'>
                          <span className='absolute left-4 top-2.5 text-gray-400 font-medium'>
                            ₹
                          </span>
                          <input
                            type='number'
                            step='0.01'
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            value={field.value || ''}
                            className={`w-full pl-8 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.annualBudget ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder='0.00'
                          />
                        </div>
                      )}
                    />
                    {errors.annualBudget && (
                      <p className='mt-1.5 text-sm text-red-500'>
                        {errors.annualBudget.message}
                      </p>
                    )}
                  </div>

                  <div className='md:col-span-2'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <div className='relative inline-flex items-center'>
                        <input
                          type='checkbox'
                          {...register('isActive')}
                          className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </div>
                      <span className='text-sm font-medium text-gray-700'>
                        Active Budget
                      </span>
                    </label>
                  </div>

                  {mode === 'edit' && (
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                        Revision Remarks
                      </label>
                      <textarea
                        {...register('remarks')}
                        className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                        placeholder='Explain the reason for budget change...'
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className='space-y-6'>
          {mode === 'edit' && (
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
              <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <Activity size={18} className='text-blue-600' />
                  </div>
                  <h2 className='text-sm font-semibold text-gray-800'>
                    Utilization Summary
                  </h2>
                </div>
              </div>
              <div className='p-6 space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>Status</span>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full border ${budget?.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                  >
                    {budget?.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className='space-y-3 pt-2'>
                  <div className='flex justify-between items-end'>
                    <div className='flex items-center gap-2 text-sm text-gray-600 font-medium'>
                      <Clock size={14} className='text-blue-500' />
                      Pending (PR)
                    </div>
                    <span className='text-sm font-semibold text-gray-900'>
                      {formatCurrency(budget?.pendingAmount)}
                    </span>
                  </div>
                  <div className='flex justify-between items-end'>
                    <div className='flex items-center gap-2 text-sm text-gray-600 font-medium'>
                      <TrendingDown size={14} className='text-orange-500' />
                      Committed (PO)
                    </div>
                    <span className='text-sm font-semibold text-gray-900'>
                      {formatCurrency(budget?.committedAmount)}
                    </span>
                  </div>
                  <div className='flex justify-between items-end'>
                    <div className='flex items-center gap-2 text-sm text-gray-600 font-medium'>
                      <CheckCircle2 size={14} className='text-green-500' />
                      Utilized (INV)
                    </div>
                    <span className='text-sm font-semibold text-gray-900'>
                      {formatCurrency(budget?.utilizedAmount)}
                    </span>
                  </div>
                </div>

                <div className='pt-4 border-t border-gray-50'>
                  <div className='flex justify-between mb-1.5'>
                    <span className='text-sm font-bold text-gray-700'>
                      Available Balance
                    </span>
                    <span className='text-sm font-bold text-violet-700'>
                      {formatCurrency(budget?.availableAmount)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-100 h-2 rounded-full overflow-hidden'>
                    <div
                      className={`h-full transition-all duration-500 ${utilizationRate > 90 ? 'bg-red-500' : utilizationRate > 75 ? 'bg-orange-500' : 'bg-violet-600'}`}
                      style={{
                        width: `${Math.max(0, Math.min(100, 100 - utilizationRate))}%`,
                      }}
                    />
                  </div>
                  <p className='text-[10px] text-gray-400 mt-1 text-right italic'>
                    {utilizationRate.toFixed(1)}% of total budget utilized
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
            <div className='flex gap-3'>
              <AlertTriangle
                className='text-amber-600 flex-shrink-0'
                size={18}
              />
              <div className='space-y-1.5'>
                <p className='text-sm font-bold text-amber-900 leading-tight'>
                  Budget Controls
                </p>
                <ul className='text-xs text-amber-800 space-y-1 list-disc pl-3'>
                  <li>
                    Allocated amounts cannot go below the currently Committed +
                    Utilized totals.
                  </li>
                  <li>
                    Revisions are logged in the transaction history and audit
                    trail.
                  </li>
                  <li>
                    Inactive budgets will block all new PR submissions for that
                    department.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
