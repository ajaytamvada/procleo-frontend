import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Tags } from 'lucide-react';
import type { SupplierCategory } from '../../hooks/useSupplierCategoryAPI';

interface SupplierCategoryFormProps {
  category?: SupplierCategory;
  onSubmit: (data: Omit<SupplierCategory, 'id'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const SupplierCategoryForm: React.FC<SupplierCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<SupplierCategory, 'id'>>({
    defaultValues: category || { name: '', code: '', description: '' },
  });

  useEffect(() => {
    if (category) {
      reset(category);
    }
  }, [category, reset]);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
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
              {category ? 'Edit Supplier Group' : 'New Supplier Group'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {category
                ? 'Update supplier group details'
                : 'Create a new supplier group record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='supplier-category-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='supplier-category-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Tags size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Supplier Group Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the supplier group details below
                </p>
              </div>
            </div>
          </div>

          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Group Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='name'
                  {...register('name', {
                    required: 'Group name is required',
                  })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter group name'
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='code'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Group Code
                </label>
                <input
                  type='text'
                  id='code'
                  {...register('code')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors'
                  placeholder='Enter group code'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700 mb-1.5'
              >
                Description
              </label>
              <textarea
                id='description'
                {...register('description')}
                rows={4}
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none'
                placeholder='Enter description (optional)'
                disabled={isSubmitting}
              />
            </div>
          </div>

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
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierCategoryForm;
