import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Minus,
  Save,
  Send,
  ArrowLeft,
  Upload,
  X,
  Calculator,
  FileText,
  Building,
  User,
  Calendar,
  Package,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { FormSkeleton } from '@/components/ui/Skeleton';
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  usePurchaseOrder,
} from '@/hooks/usePurchaseOrders';
import type {
  PurchaseOrderFormData,
  PurchaseOrderItemFormData,
} from '@/lib/validations';
import { purchaseOrderSchema } from '@/lib/validations';
import type { PurchaseOrder, Address } from '@/types/purchase-order';
import { formatCurrency, cn } from '@/lib/utils';

// Mock data - would come from API
const mockVendors = [
  {
    id: '1',
    name: 'ABC Suppliers',
    email: 'contact@abc.com',
    gstNumber: '27AAAAA0000A1Z5',
  },
  {
    id: '2',
    name: 'XYZ Technologies',
    email: 'info@xyz.com',
    gstNumber: '19BBBBB1111B2Z6',
  },
];

const mockUsers = [
  { id: '1', name: 'John Doe', department: 'IT', email: 'john@company.com' },
  {
    id: '2',
    name: 'Jane Smith',
    department: 'Finance',
    email: 'jane@company.com',
  },
];

const mockCategories = [
  'Hardware',
  'Software',
  'Services',
  'Office Supplies',
  'Furniture',
  'Equipment',
];

const mockUnits = ['Piece', 'Kilogram', 'Meter', 'Liter', 'Set', 'Hour', 'Day'];

const paymentTerms = ['Net 30', 'Net 45', 'Net 60', 'COD', 'Advance Payment'];
const deliveryTerms = [
  'FOB Origin',
  'FOB Destination',
  'CIF',
  'Ex Works',
  'DDP',
];

interface PurchaseOrderFormProps {
  mode?: 'create' | 'edit';
}

export function PurchaseOrderForm({ mode = 'create' }: PurchaseOrderFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const isEditMode = mode === 'edit' && id;

  // Hooks
  const createPoMutation = useCreatePurchaseOrder();
  const updatePoMutation = useUpdatePurchaseOrder();
  const { data: existingPo, isLoading: loadingPo } = usePurchaseOrder(id || '');

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      vendorId: '',
      priority: 'medium',
      description: '',
      items: [
        {
          description: '',
          specification: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 18,
          category: '',
          unit: 'Piece',
        },
      ],
      paymentTerms: 'Net 30',
      deliveryTerms: '',
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedVendorId = watch('vendorId');

  // Calculate totals
  const calculations = React.useMemo(() => {
    const itemTotals = watchedItems.map((item, index) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const discount = item.discount || 0;
      const taxRate = item.taxRate || 0;

      const subtotal = quantity * unitPrice;
      const discountAmount = subtotal * (discount / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * (taxRate / 100);
      const total = afterDiscount + taxAmount;

      return {
        subtotal,
        discountAmount,
        taxAmount,
        total,
      };
    });

    const grandSubtotal = itemTotals.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const grandDiscountAmount = itemTotals.reduce(
      (sum, item) => sum + item.discountAmount,
      0
    );
    const grandTaxAmount = itemTotals.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    );
    const grandTotal = itemTotals.reduce((sum, item) => sum + item.total, 0);

    return {
      itemTotals,
      grandSubtotal,
      grandDiscountAmount,
      grandTaxAmount,
      grandTotal,
    };
  }, [watchedItems]);

  // Load existing PO data in edit mode
  useEffect(() => {
    if (existingPo && isEditMode) {
      reset({
        vendorId: existingPo?.vendorId || '',
        priority: (existingPo as any)?.priority || 'medium',
        description: existingPo?.description || '',
        items: (existingPo?.items || []).map(item => ({
          productId: (item as any)?.productId || '',
          description: item.description,
          specification:
            (item as any)?.specification || (item as any)?.specifications || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: (item as any)?.discount || 0,
          taxRate: (item as any)?.taxRate || 0,
          category: item.category,
          subcategory: (item as any)?.subcategory || '',
          unit: (item as any)?.unit || '',
          brand: (item as any)?.brand || '',
          model: (item as any)?.model || '',
          partNumber: (item as any)?.partNumber || '',
          deliveryDate: (item as any)?.deliveryDate || '',
          notes: (item as any)?.notes || '',
        })),
        paymentTerms: (existingPo as any)?.paymentTerms || 'Net 30',
        deliveryTerms: (existingPo as any)?.deliveryTerms || '',
        expectedDelivery: existingPo?.expectedDelivery || '',
        notes: existingPo?.description || '',
      });
    }
  }, [existingPo, isEditMode, reset]);

  // Update selected vendor when vendor ID changes
  useEffect(() => {
    if (watchedVendorId) {
      const vendor = mockVendors.find(v => v.id === watchedVendorId);
      setSelectedVendor(vendor);
    }
  }, [watchedVendorId]);

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      // Transform items to include totalPrice
      const transformedData = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          totalPrice:
            item.quantity * item.unitPrice -
            (item.quantity * item.unitPrice * item.discount) / 100 +
            (item.quantity * item.unitPrice * item.taxRate) / 100,
        })),
      };

      if (isEditMode) {
        await updatePoMutation.mutateAsync({
          id: id!,
          data: transformedData,
        });
      } else {
        await createPoMutation.mutateAsync(transformedData);
      }
      navigate('/purchases');
    } catch (error) {
      console.error('Failed to save purchase order:', error);
    }
  };

  const addItem = () => {
    append({
      description: '',
      specification: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      category: '',
      unit: 'Piece',
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const breadcrumbItems = [
    { label: 'Purchase Management', href: '/purchases' },
    { label: 'Purchase Orders', href: '/purchases' },
    {
      label: isEditMode ? 'Edit Purchase Order' : 'New Purchase Order',
      isActive: true,
    },
  ];

  if (loadingPo && isEditMode) {
    return (
      <div className='space-y-6'>
        <Breadcrumbs items={breadcrumbItems} />
        <FormSkeleton />
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: FileText },
    { id: 'items', label: 'Line Items', icon: Package },
    { id: 'terms', label: 'Terms & Conditions', icon: Building },
    { id: 'attachments', label: 'Attachments', icon: Upload },
  ];

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => navigate('/purchases')}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
            </h1>
            <p className='text-gray-500 mt-1'>
              {isEditMode
                ? `Editing PO #${existingPo?.poNumber || 'N/A'}`
                : 'Create a new purchase order'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>
            Total: {formatCurrency(calculations.grandTotal)}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Tab Navigation */}
        <Card>
          <div className='border-b border-gray-200 px-6'>
            <nav className='-mb-px flex gap-6'>
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex items-center gap-2 pb-3 px-1 font-medium text-sm transition-all duration-200
                      border-0 outline-none bg-transparent
                      ${
                        activeTab === tab.id
                          ? 'text-violet-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                    />
                    <span>{tab.label}</span>
                    {/* Active/Hover/Focus indicator */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-violet-600'
                          : 'bg-transparent group-hover:bg-gray-300 group-focus:bg-violet-400'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          <CardContent className='p-6'>
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Vendor Selection */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Vendor <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                      name='vendorId'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value=''>Select Vendor</option>
                          {mockVendors.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.vendorId && (
                      <p className='text-sm text-red-600'>
                        {errors.vendorId.message}
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Priority <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                      name='priority'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value='low'>Low</option>
                          <option value='medium'>Medium</option>
                          <option value='high'>High</option>
                          <option value='urgent'>Urgent</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Expected Delivery */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Expected Delivery Date
                    </label>
                    <Controller
                      name='expectedDelivery'
                      control={control}
                      render={({ field }) => (
                        <Input type='date' {...field} className='w-full' />
                      )}
                    />
                  </div>
                </div>

                {/* Vendor Details */}
                {selectedVendor && (
                  <Card>
                    <CardHeader>
                      <h3 className='text-lg font-medium'>Vendor Details</h3>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm text-gray-600'>Name</p>
                          <p className='font-medium'>{selectedVendor.name}</p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>Email</p>
                          <p className='font-medium'>{selectedVendor.email}</p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-600'>GST Number</p>
                          <p className='font-medium'>
                            {selectedVendor.gstNumber}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Description */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Description
                  </label>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder='Enter purchase order description...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        maxLength={2000}
                      />
                    )}
                  />
                  <div className='text-right text-xs text-gray-500'>
                    {watch('description')?.length || 0}/2000 characters
                  </div>
                </div>
              </div>
            )}

            {/* Line Items Tab */}
            {activeTab === 'items' && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium'>Line Items</h3>
                  <Button type='button' onClick={addItem} size='sm'>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Item
                  </Button>
                </div>

                <div className='space-y-4'>
                  {fields.map((field, index) => (
                    <Card key={field.id} className='p-4'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-medium'>Item #{index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeItem(index)}
                          >
                            <Minus className='w-4 h-4' />
                          </Button>
                        )}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {/* Description */}
                        <div className='md:col-span-2 space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Description <span className='text-red-500'>*</span>
                          </label>
                          <Controller
                            name={`items.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder='Item description'
                                error={
                                  errors.items?.[index]?.description?.message
                                }
                              />
                            )}
                          />
                        </div>

                        {/* Category */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Category <span className='text-red-500'>*</span>
                          </label>
                          <Controller
                            name={`items.${index}.category`}
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                              >
                                <option value=''>Select Category</option>
                                {mockCategories.map(cat => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>

                        {/* Specification */}
                        <div className='md:col-span-3 space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Specification
                          </label>
                          <Controller
                            name={`items.${index}.specification`}
                            control={control}
                            render={({ field }) => (
                              <textarea
                                {...field}
                                rows={2}
                                placeholder='Technical specifications, requirements, etc.'
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                              />
                            )}
                          />
                        </div>

                        {/* Quantity */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Quantity <span className='text-red-500'>*</span>
                          </label>
                          <Controller
                            name={`items.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type='number'
                                min='1'
                                step='1'
                                {...field}
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                                error={errors.items?.[index]?.quantity?.message}
                              />
                            )}
                          />
                        </div>

                        {/* Unit */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Unit <span className='text-red-500'>*</span>
                          </label>
                          <Controller
                            name={`items.${index}.unit`}
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                              >
                                {mockUnits.map(unit => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>

                        {/* Unit Price */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Unit Price <span className='text-red-500'>*</span>
                          </label>
                          <Controller
                            name={`items.${index}.unitPrice`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type='number'
                                min='0'
                                step='0.01'
                                {...field}
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                                error={
                                  errors.items?.[index]?.unitPrice?.message
                                }
                              />
                            )}
                          />
                        </div>

                        {/* Discount */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Discount (%)
                          </label>
                          <Controller
                            name={`items.${index}.discount`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type='number'
                                min='0'
                                max='100'
                                step='0.01'
                                {...field}
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            )}
                          />
                        </div>

                        {/* Tax Rate */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Tax Rate (%)
                          </label>
                          <Controller
                            name={`items.${index}.taxRate`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type='number'
                                min='0'
                                max='100'
                                step='0.01'
                                {...field}
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            )}
                          />
                        </div>

                        {/* Calculated Total */}
                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Total Amount
                          </label>
                          <div className='px-3 py-2 bg-gray-50 border border-gray-300 rounded-md'>
                            {formatCurrency(
                              calculations.itemTotals[index]?.total || 0
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between'>
                    <h3 className='text-lg font-medium'>Order Summary</h3>
                    <Calculator className='w-5 h-5 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span>Subtotal:</span>
                        <span>
                          {formatCurrency(calculations.grandSubtotal)}
                        </span>
                      </div>
                      <div className='flex justify-between text-red-600'>
                        <span>Discount:</span>
                        <span>
                          -{formatCurrency(calculations.grandDiscountAmount)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Tax:</span>
                        <span>
                          {formatCurrency(calculations.grandTaxAmount)}
                        </span>
                      </div>
                      <div className='border-t pt-2'>
                        <div className='flex justify-between font-bold text-lg'>
                          <span>Grand Total:</span>
                          <span>{formatCurrency(calculations.grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Terms & Conditions Tab */}
            {activeTab === 'terms' && (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Payment Terms */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Payment Terms <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                      name='paymentTerms'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          {paymentTerms.map(term => (
                            <option key={term} value={term}>
                              {term}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Delivery Terms */}
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Delivery Terms
                    </label>
                    <Controller
                      name='deliveryTerms'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                          <option value=''>Select Delivery Terms</option>
                          {deliveryTerms.map(term => (
                            <option key={term} value={term}>
                              {term}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Additional Notes
                  </label>
                  <Controller
                    name='notes'
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={6}
                        placeholder='Enter any additional terms, conditions, or special instructions...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        maxLength={1000}
                      />
                    )}
                  />
                  <div className='text-right text-xs text-gray-500'>
                    {watch('notes')?.length || 0}/1000 characters
                  </div>
                </div>
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className='space-y-6'>
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-2 block'>
                    Upload Documents
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                    <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                    <p className='text-sm text-gray-600 mb-2'>
                      Click to upload or drag and drop files here
                    </p>
                    <input
                      type='file'
                      multiple
                      accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
                      onChange={handleFileUpload}
                      className='hidden'
                      id='file-upload'
                    />
                    <label
                      htmlFor='file-upload'
                      className='cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                    >
                      <Upload className='w-4 h-4 mr-2' />
                      Choose Files
                    </label>
                    <p className='text-xs text-gray-500 mt-2'>
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                      (Max 10MB each)
                    </p>
                  </div>
                </div>

                {/* Uploaded Files */}
                {attachments.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium text-gray-700'>
                      Uploaded Files
                    </h4>
                    <div className='space-y-2'>
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                        >
                          <div className='flex items-center gap-3'>
                            <FileText className='w-5 h-5 text-gray-400' />
                            <div>
                              <p className='text-sm font-medium'>{file.name}</p>
                              <p className='text-xs text-gray-500'>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeAttachment(index)}
                          >
                            <X className='w-4 h-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex items-center justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate('/purchases')}
          >
            Cancel
          </Button>

          <div className='flex items-center gap-2'>
            <Button type='submit' disabled={isSubmitting} variant='outline'>
              <Save className='w-4 h-4 mr-2' />
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              <Send className='w-4 h-4 mr-2' />
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
