import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Budget } from '../../types';
import { useAllFinancialYears } from '../../hooks/useFinancialYearAPI';
import { useDepartmentsList } from '../../hooks/useDepartmentAPI';

// Validation schema
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

  // Fetch financial years and departments for dropdowns
  const { data: financialYears = [], isLoading: loadingFinancialYears } =
    useAllFinancialYears();
  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartmentsList();

  // Update form when budget data changes
  React.useEffect(() => {
    if (budget) {
      reset(budget);
    }
  }, [budget, reset]);

  const handleFormSubmit = (data: BudgetFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    if (budget) {
      reset(budget);
    } else {
      reset({
        financialYearId: 0,
        departmentId: '',
        annualBudget: 0,
      });
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {mode === 'create' ? 'Create Budget' : 'Edit Budget'}
        </h2>
        <p className='text-sm text-gray-600 mt-1'>
          {mode === 'create'
            ? 'Add a new budget to the system'
            : 'Update budget information'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
        {/* Basic Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Financial Year Dropdown */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.financialYearId
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  disabled={loadingFinancialYears || mode === 'edit'}
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
              <p className='mt-1 text-sm text-red-600'>
                {errors.financialYearId.message}
              </p>
            )}
          </div>

          {/* Department Dropdown */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Department <span className='text-red-500'>*</span>
            </label>
            <select
              {...register('departmentId')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.departmentId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loadingDepartments || mode === 'edit'}
            >
              <option value=''>Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.code}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.departmentId.message}
              </p>
            )}
          </div>

          {/* Annual Budget Input */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.annualBudget ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Enter annual budget amount'
                />
              )}
            />
            {errors.annualBudget && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.annualBudget.message}
              </p>
            )}
          </div>
        </div>

        {mode === 'edit' && budget && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
            <p className='text-sm text-yellow-800'>
              <strong>Note:</strong> Financial Year and Department cannot be
              changed when editing. Only the Annual Budget amount can be
              updated.
            </p>
          </div>
        )}

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
                ? 'Create Budget'
                : 'Update Budget'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
