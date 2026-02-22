import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import type { Building } from '../../hooks/useBuildingAPI';

const buildingSchema = z.object({
  name: z
    .string()
    .min(1, 'Building name is required')
    .max(100, 'Building name cannot exceed 100 characters'),
  code: z
    .string()
    .min(1, 'Building code is required')
    .max(50, 'Building code cannot exceed 50 characters'),
});

type BuildingFormData = z.infer<typeof buildingSchema>;

interface BuildingFormProps {
  building?: Building;
  onSubmit: (data: BuildingFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const BuildingForm: React.FC<BuildingFormProps> = ({
  building,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: building || {
      name: '',
      code: '',
    },
  });

  React.useEffect(() => {
    if (building) {
      reset(building);
    }
  }, [building, reset]);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition-colors'
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {building?.id ? 'Edit Building' : 'New Building'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {building?.id
                ? 'Update building details'
                : 'Create a new building record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='building-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='building-form' onSubmit={handleSubmit(onSubmit)}>
          {/* Form Header */}
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Building2 size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Building Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the building details below
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* Building Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Building Name <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  type='text'
                  id='name'
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter building name (e.g., Main Building, Block A)'
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Building Code */}
              <div>
                <label
                  htmlFor='code'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Building Code <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('code')}
                  type='text'
                  id='code'
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.code ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter building code (e.g., MAIN, BLK-A)'
                  disabled={isSubmitting}
                />
                {errors.code && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              <Save size={15} />
              {isSubmitting ? 'Saving...' : building?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildingForm;
