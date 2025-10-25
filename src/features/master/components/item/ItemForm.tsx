import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Item } from '../../hooks/useItemAPI';
import { useCategories } from '../../hooks/useCategoryAPI';
import { useSubCategoriesByCategoryId } from '../../hooks/useSubCategoryAPI';
import { useUOMs } from '../../hooks/useUOMAPI';

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: Omit<Item, 'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    item?.categoryId || null
  );
  const [make, setMake] = useState(item?.make || '');
  const [modelName, setModelName] = useState(item?.modelName || '');

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: subCategories = [], isLoading: subCategoriesLoading } =
    useSubCategoriesByCategoryId(selectedCategoryId);
  const { data: uoms = [], isLoading: uomsLoading } = useUOMs();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<Omit<Item, 'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'>>({
    defaultValues: item || {
      categoryId: 0,
      subCategoryId: 0,
      uomId: 0,
      make: '',
      modelName: '',
      code: '',
      description: '',
    },
  });

  const categoryId = watch('categoryId');

  useEffect(() => {
    if (item) {
      reset({
        categoryId: item.categoryId,
        subCategoryId: item.subCategoryId,
        uomId: item.uomId,
        make: item.make,
        modelName: item.modelName,
        code: item.code,
        description: item.description,
      });
      setSelectedCategoryId(item.categoryId);
      setMake(item.make);
      setModelName(item.modelName);
    }
  }, [item, reset]);

  useEffect(() => {
    if (categoryId && categoryId > 0 && categoryId !== selectedCategoryId) {
      setSelectedCategoryId(categoryId);
      setValue('subCategoryId', 0);
    }
  }, [categoryId, selectedCategoryId, setValue]);

  const displayName = make && modelName ? `${make} ${modelName}` : '';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {item ? 'Edit Item' : 'Create Item'}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Sub-Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('subCategoryId', {
                  required: 'Sub-category is required',
                  validate: (value) => value > 0 || 'Please select a sub-category',
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subCategoryId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!selectedCategoryId || subCategoriesLoading}
              >
                <option value={0}>
                  {!selectedCategoryId
                    ? 'Select a category first'
                    : 'Select a sub-category'}
                </option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              {errors.subCategoryId && (
                <p className="mt-1 text-sm text-red-500">{errors.subCategoryId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('make', { required: 'Make is required' })}
                onChange={(e) => setMake(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.make ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter make"
              />
              {errors.make && (
                <p className="mt-1 text-sm text-red-500">{errors.make.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('modelName', { required: 'Model name is required' })}
                onChange={(e) => setModelName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.modelName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter model name"
              />
              {errors.modelName && (
                <p className="mt-1 text-sm text-red-500">{errors.modelName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
              placeholder="Auto-generated from Make + Model Name"
            />
            <p className="mt-1 text-sm text-gray-500">
              This field is auto-generated from Make and Model Name
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Code
              </label>
              <input
                type="text"
                {...register('code')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UOM (Unit of Measure) <span className="text-red-500">*</span>
              </label>
              <select
                {...register('uomId', {
                  required: 'UOM is required',
                  validate: (value) => value > 0 || 'Please select a UOM',
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.uomId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={uomsLoading}
              >
                <option value={0}>Select a UOM</option>
                {uoms.map((uom) => (
                  <option key={uom.id} value={uom.id}>
                    {uom.name}
                  </option>
                ))}
              </select>
              {errors.uomId && (
                <p className="mt-1 text-sm text-red-500">{errors.uomId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
            />
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
              {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
