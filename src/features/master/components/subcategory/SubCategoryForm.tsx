import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Layers } from 'lucide-react';
import type { SubCategory } from '../../hooks/useSubCategoryAPI';
import { useCategories } from '../../hooks/useCategoryAPI';

interface SubCategoryFormProps {
  subCategory?: SubCategory;
  onSubmit: (data: Omit<SubCategory, 'id' | 'categoryName'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
  subCategory,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<SubCategory, 'id' | 'categoryName'>>({
    defaultValues: subCategory || {
      categoryId: 0,
      name: '',
      code: '',
      assetPrefix: '',
    },
  });

  useEffect(() => {
    if (subCategory) {
      reset({
        categoryId: subCategory.categoryId,
        name: subCategory.name,
        code: subCategory.code,
        assetPrefix: subCategory.assetPrefix,
      });
    }
  }, [subCategory, reset]);

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
              {subCategory ? 'Edit Sub-Category' : 'New Sub-Category'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {subCategory
                ? 'Update sub-category details'
                : 'Create a new sub-category record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='subcategory-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='subcategory-form' onSubmit={handleSubmit(onSubmit)}>
          {/* Form Header */}
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Layers size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Sub-Category Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the sub-category details below
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* Category */}
              <div>
                <label
                  htmlFor='categoryId'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Category <span className='text-red-500'>*</span>
                </label>
                <select
                  id='categoryId'
                  {...register('categoryId', {
                    required: 'Category is required',
                    validate: value => value > 0 || 'Please select a category',
                  })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.categoryId ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={categoriesLoading || isSubmitting}
                >
                  <option value={0}>Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Sub-Category Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Sub-Category Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='name'
                  {...register('name', {
                    required: 'Sub-category name is required',
                  })}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter sub-category name'
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Sub-Category Code */}
              <div>
                <label
                  htmlFor='code'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Sub-Category Code
                </label>
                <input
                  type='text'
                  id='code'
                  {...register('code')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors'
                  placeholder='Enter sub-category code'
                  disabled={isSubmitting}
                />
              </div>

              {/* Asset Prefix */}
              <div>
                <label
                  htmlFor='assetPrefix'
                  className='block text-sm font-medium text-gray-700 mb-1.5'
                >
                  Asset Prefix{' '}
                  <span className='text-gray-400 text-xs'>
                    (max 3 characters)
                  </span>
                </label>
                <input
                  type='text'
                  id='assetPrefix'
                  {...register('assetPrefix', {
                    maxLength: {
                      value: 3,
                      message: 'Asset prefix cannot exceed 3 characters',
                    },
                  })}
                  maxLength={3}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
                    errors.assetPrefix ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder='Enter asset prefix'
                  disabled={isSubmitting}
                />
                {errors.assetPrefix && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.assetPrefix.message}
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
              {isSubmitting ? 'Saving...' : subCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryForm;
