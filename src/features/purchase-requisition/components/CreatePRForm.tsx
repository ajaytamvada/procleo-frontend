import React, { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { PRItemsTable } from './PRItemsTable';
import { Edit, Plus } from 'lucide-react';

interface PurchaseRequisitionItem {
  id: string;
  model: string;
  make: string;
  category: string;
  subCategory: string;
  uom: string;
  description: string;
  quantity: number;
  indicativePrice: number;
  subTotal: number;
}

interface CreatePRFormData {
  requestor: string;
  location: string;
  approvalGroup: string;
  requestedDate: string;
  department: string;
  justification: string;
  items: Omit<PurchaseRequisitionItem, 'id' | 'subTotal'>[];
}

const createPRSchema = z.object({
  requestor: z.string().min(1, 'Requestor is required'),
  location: z.string().min(1, 'Location is required'),
  approvalGroup: z.string().min(1, 'Approval Group is required'),
  requestedDate: z.string().min(1, 'Requested Date is required'),
  department: z.string().min(1, 'Department is required'),
  justification: z.string(),
  items: z
    .array(
      z.object({
        model: z.string().min(1, 'Model is required'),
        make: z.string().min(1, 'Make is required'),
        category: z.string().min(1, 'Category is required'),
        subCategory: z.string().min(1, 'Sub Category is required'),
        uom: z.string().min(1, 'UOM is required'),
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        indicativePrice: z.number().min(0, 'Price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
}) satisfies z.ZodType<CreatePRFormData>;

interface CreatePRFormProps {
  onSubmit: (data: CreatePRFormData, isDraft: boolean) => void;
  initialData?: Partial<CreatePRFormData>;
  isLoading?: boolean;
}

export const CreatePRForm: React.FC<CreatePRFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePRFormData>({
    resolver: zodResolver(createPRSchema),
    defaultValues: {
      requestor: initialData?.requestor || '',
      location: initialData?.location || '',
      approvalGroup: initialData?.approvalGroup || '',
      requestedDate:
        initialData?.requestedDate || new Date().toISOString().split('T')[0],
      department: initialData?.department || '',
      justification: initialData?.justification || '',
      items: initialData?.items || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  const handleAddItem = () => {
    append({
      model: '',
      make: '',
      category: '',
      subCategory: '',
      uom: '',
      description: '',
      quantity: 1,
      indicativePrice: 0,
    });
  };

  const handleItemUpdate = (
    index: number,
    item: Omit<PurchaseRequisitionItem, 'id' | 'subTotal'>
  ) => {
    update(index, item);
  };

  const calculateSubTotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const getTotalAmount = () => {
    return watchedItems.reduce((total, item) => {
      return total + calculateSubTotal(item.quantity, item.indicativePrice);
    }, 0);
  };

  const onSubmitForm: SubmitHandler<CreatePRFormData> = (
    data: CreatePRFormData
  ) => {
    onSubmit(data, false);
  };

  const onSaveDraft = () => {
    const data = watch();
    onSubmit(data, true);
  };

  return (
    <div className='min-h-screen' style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold' style={{ color: '#1a0b2e' }}>
          Create Purchase Requisition
        </h1>
        <div className='flex items-center space-x-3'>
          <button
            type='button'
            onClick={onSaveDraft}
            disabled={isLoading}
            className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              backgroundColor: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <Edit className='h-4 w-4 mr-2' />
            <span>Save As Draft</span>
          </button>
          <button
            type='submit'
            form='create-pr-form'
            disabled={isLoading}
            className='inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow =
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            Submit
          </button>
        </div>
      </div>

      <form
        id='create-pr-form'
        onSubmit={handleSubmit(onSubmitForm)}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Basic Information */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow:
              '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Requestor
              </label>
              <select
                {...register('requestor')}
                className='w-full px-3 py-2 rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                style={{ border: '1px solid #e5e7eb' }}
              >
                <option value=''>Wei</option>
                <option value='Wei'>Wei</option>
                <option value='John Doe'>John Doe</option>
                <option value='Jane Smith'>Jane Smith</option>
              </select>
              {errors.requestor && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.requestor.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Requested Date
              </label>
              <Input
                type='date'
                {...register('requestedDate')}
                error={errors.requestedDate?.message}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Location
              </label>
              <select
                {...register('location')}
                className='w-full px-3 py-2 rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                style={{ border: '1px solid #e5e7eb' }}
              >
                <option value=''>Select</option>
                <option value='Head Office'>Head Office</option>
                <option value='Branch Office'>Branch Office</option>
                <option value='Warehouse'>Warehouse</option>
              </select>
              {errors.location && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.location.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Department
              </label>
              <select
                {...register('department')}
                className='w-full px-3 py-2 rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                style={{ border: '1px solid #e5e7eb' }}
              >
                <option value=''>Select</option>
                <option value='Customer Service'>Customer Service</option>
                <option value='IT'>IT</option>
                <option value='Finance'>Finance</option>
                <option value='HR'>HR</option>
              </select>
              {errors.department && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.department.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Approval Group
              </label>
              <select
                {...register('approvalGroup')}
                className='w-full px-3 py-2 rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                style={{ border: '1px solid #e5e7eb' }}
              >
                <option value=''>Select</option>
                <option value='Management'>Management</option>
                <option value='Department Head'>Department Head</option>
                <option value='Finance Team'>Finance Team</option>
              </select>
              {errors.approvalGroup && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.approvalGroup.message}
                </p>
              )}
            </div>
          </div>

          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Justification
            </label>
            <textarea
              {...register('justification')}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter justification for this purchase requisition...'
            />
          </div>
        </div>

        {/* Item Details */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow:
              '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold' style={{ color: '#1a0b2e' }}>
              Item Details
            </h3>
            <button
              type='button'
              onClick={handleAddItem}
              className='inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200'
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: '1px solid #e5e7eb',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              <Plus className='h-4 w-4 mr-2' />
              <span>Add New Line Item</span>
            </button>
          </div>

          <PRItemsTable
            items={fields.map((field, index) => ({
              ...field,
              id: field.id,
              subTotal: calculateSubTotal(
                watchedItems[index]?.quantity || 0,
                watchedItems[index]?.indicativePrice || 0
              ),
            }))}
            onItemUpdate={handleItemUpdate}
            onItemRemove={remove}
            errors={errors.items as any}
          />

          {errors.items?.root && (
            <p className='mt-2 text-sm text-red-600'>
              {errors.items.root.message}
            </p>
          )}

          <div className='mt-6 pt-4' style={{ borderTop: '1px solid #e5e7eb' }}>
            <div className='flex justify-end'>
              <div
                className='text-xl font-semibold'
                style={{ color: '#1a0b2e' }}
              >
                Total Amount: ₹{getTotalAmount().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
