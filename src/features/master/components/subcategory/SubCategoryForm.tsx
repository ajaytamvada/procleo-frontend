import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {subCategory ? 'Edit Sub-Category' : 'Create Sub-Category'}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('categoryId', {
                required: 'Category is required',
                validate: (value) => value > 0 || 'Please select a category',
              })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={categoriesLoading}
            >
              <option value={0}>Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'Sub-category name is required' })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter sub-category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Category Code
            </label>
            <input
              type="text"
              {...register('code')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sub-category code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Prefix (max 3 characters)
            </label>
            <input
              type="text"
              {...register('assetPrefix', {
                maxLength: {
                  value: 3,
                  message: 'Asset prefix cannot exceed 3 characters',
                },
              })}
              maxLength={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.assetPrefix ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter asset prefix"
            />
            {errors.assetPrefix && (
              <p className="mt-1 text-sm text-red-500">{errors.assetPrefix.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Saving...' : subCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryForm;
