import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Layers } from 'lucide-react';
import type { Department } from '../../types';

// Validation schema
const departmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(90, 'Name cannot exceed 90 characters'),
  code: z
    .string()
    .min(1, 'Department code is required')
    .max(90, 'Code cannot exceed 90 characters'),
  remarks: z
    .string()
    .max(500, 'Remarks cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: DepartmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
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
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department || {},
    mode: 'onChange',
  });

  // Update form when department data changes
  React.useEffect(() => {
    if (department) {
      reset(department);
    }
  }, [department, reset]);

  const handleFormSubmit = (data: DepartmentFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    if (department) {
      reset(department);
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
              {mode === 'create' ? 'Create Department' : 'Edit Department'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {mode === 'create'
                ? 'Add a new department to the system'
                : 'Update department information'}
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
                ? 'Create Department'
                : 'Update Department'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
        {/* Department Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='bg-[#fafbfc] px-5 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-2'>
              <Layers size={16} className='text-violet-600' />
              <h3 className='text-base font-semibold text-gray-900'>
                Department Information
              </h3>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Department Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('name')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder='Enter department name'
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-600'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Department Code <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('code')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.code ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder='Enter department code'
                />
                {errors.code && (
                  <p className='mt-1.5 text-sm text-red-600'>
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks
                </label>
                <textarea
                  {...register('remarks')}
                  rows={3}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter remarks (optional)'
                />
                {errors.remarks && (
                  <p className='mt-1.5 text-sm text-red-600'>
                    {errors.remarks.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
