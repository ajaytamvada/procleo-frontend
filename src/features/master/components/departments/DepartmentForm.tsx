import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Department } from '../../types';

// Validation schema
const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(90, 'Name cannot exceed 90 characters'),
  code: z.string().min(1, 'Department code is required').max(90, 'Code cannot exceed 90 characters'),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional().or(z.literal('')),
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create Department' : 'Edit Department'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'create' ? 'Add a new department to the system' : 'Update department information'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter department name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter department code"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            {...register('remarks')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter remarks (optional)"
          />
          {errors.remarks && (
            <p className="mt-1 text-sm text-red-600">{errors.remarks.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="border-t pt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Department' : 'Update Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
