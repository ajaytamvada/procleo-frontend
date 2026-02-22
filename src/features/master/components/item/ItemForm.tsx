import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Package } from 'lucide-react';
import type { Item } from '../../hooks/useItemAPI';
import { useCategories } from '../../hooks/useCategoryAPI';
import { useSubCategoriesByCategoryId } from '../../hooks/useSubCategoryAPI';
import { useUOMs } from '../../hooks/useUOMAPI';

interface ItemFormProps {
  item?: Item;
  onSubmit: (
    data: Omit<
      Item,
      'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'
    >
  ) => void;
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

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
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
  } = useForm<
    Omit<
      Item,
      'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'
    >
  >({
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

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors ${
      hasError ? 'border-red-500' : 'border-gray-200'
    }`;

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
              {item ? 'Edit Item' : 'New Item'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {item ? 'Update item details' : 'Create a new item record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='item-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='item-form' onSubmit={handleSubmit(onSubmit)}>
          {/* Form Header */}
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Package size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Item Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the item details below
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* Category */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Category <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('categoryId', {
                    required: 'Category is required',
                    validate: value => value > 0 || 'Please select a category',
                  })}
                  className={inputClass(!!errors.categoryId)}
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

              {/* Sub-Category */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Sub-Category <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('subCategoryId', {
                    required: 'Sub-category is required',
                    validate: value =>
                      value > 0 || 'Please select a sub-category',
                  })}
                  className={inputClass(!!errors.subCategoryId)}
                  disabled={
                    !selectedCategoryId || subCategoriesLoading || isSubmitting
                  }
                >
                  <option value={0}>
                    {!selectedCategoryId
                      ? 'Select a category first'
                      : 'Select a sub-category'}
                  </option>
                  {subCategories.map(subCategory => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
                {errors.subCategoryId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.subCategoryId.message}
                  </p>
                )}
              </div>

              {/* Make */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Make <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('make', { required: 'Make is required' })}
                  onChange={e => {
                    setMake(e.target.value);
                    setValue('make', e.target.value);
                  }}
                  className={inputClass(!!errors.make)}
                  placeholder='Enter make'
                  disabled={isSubmitting}
                />
                {errors.make && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.make.message}
                  </p>
                )}
              </div>

              {/* Model Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Model Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('modelName', {
                    required: 'Model name is required',
                  })}
                  onChange={e => {
                    setModelName(e.target.value);
                    setValue('modelName', e.target.value);
                  }}
                  className={inputClass(!!errors.modelName)}
                  placeholder='Enter model name'
                  disabled={isSubmitting}
                />
                {errors.modelName && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.modelName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Display Name
              </label>
              <input
                type='text'
                value={displayName}
                disabled
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600'
                placeholder='Auto-generated from Make + Model Name'
              />
              <p className='mt-1.5 text-xs text-gray-500'>
                This field is auto-generated from Make and Model Name
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* Item Code */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Item Code
                </label>
                <input
                  type='text'
                  {...register('code')}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors'
                  placeholder='Enter item code'
                  disabled={isSubmitting}
                />
              </div>

              {/* UOM */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  UOM (Unit of Measure) <span className='text-red-500'>*</span>
                </label>
                <select
                  {...register('uomId', {
                    required: 'UOM is required',
                    validate: value => value > 0 || 'Please select a UOM',
                  })}
                  className={inputClass(!!errors.uomId)}
                  disabled={uomsLoading || isSubmitting}
                >
                  <option value={0}>Select a UOM</option>
                  {uoms.map(uom => (
                    <option key={uom.id} value={uom.id}>
                      {uom.name}
                    </option>
                  ))}
                </select>
                {errors.uomId && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.uomId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none'
                placeholder='Enter description'
                disabled={isSubmitting}
              />
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
              {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
