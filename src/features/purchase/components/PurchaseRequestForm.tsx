import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AlertDialog } from '@/components/ui/Dialog';
import type { PurchaseRequest, PurchaseRequestItem } from '../types';
import { useItemSearch } from '../hooks/useItemSearch';
import { useDepartmentsList } from '@/features/master/hooks/useDepartmentAPI';
import { useCities } from '@/features/master/hooks/useCityAPI';
import { AuthService } from '@/services/auth';
import {
  downloadExcelTemplate,
  parseExcelFile,
  validateLineItems,
  type ExcelLineItem,
} from '../utils/excelUtils';
import { apiClient } from '@/lib/api';
import ExcelImportDialog from '@/components/ExcelImportDialog';

type PurchaseRequestItemFormData = {
  id: number;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  displayName: string;
  modelName?: string;
  make: string;
  uomId: number;
  uomName: string;
};

const purchaseRequestSchema = z.object({
  requestDate: z.string().min(1, 'Request date is required'),
  requestedBy: z.string().min(1, 'Requestor is required'),
  departmentId: z.number().min(1, 'Department is required'),
  locationId: z.number().min(1, 'Location is required'),
  purchaseType: z.string().min(1, 'Purchase Type is required'),
  projectCode: z.string().optional(),
  projectName: z.string().min(1, 'Project Name is required'),
  remarks: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z
          .number()
          .nullable()
          .optional()
          .transform(v => v ?? 0),
        categoryId: z
          .number()
          .nullable()
          .optional()
          .transform(v => v ?? 0),
        categoryName: z
          .string()
          .nullable()
          .optional()
          .transform(v => v ?? ''),
        subCategoryId: z
          .number()
          .nullable()
          .optional()
          .transform(v => v ?? 0),
        subCategoryName: z
          .string()
          .nullable()
          .optional()
          .transform(v => v ?? ''),
        modelName: z
          .string()
          .nullable()
          .optional()
          .transform(v => v ?? ''),
        make: z
          .string()
          .nullable()
          .optional()
          .transform(v => v ?? ''),
        uomId: z
          .number()
          .nullable()
          .optional()
          .transform(v => v ?? 0),
        uomName: z
          .string()
          .nullable()
          .optional()
          .transform(v => v ?? ''),
        quantity: z
          .number()
          .nullable()
          .optional()
          .transform(v => v ?? 1)
          .pipe(z.number().min(1, 'Quantity must be at least 1')),
        unitPrice: z
          .number()
          .nullable()
          .optional()
          .transform(v => v ?? 0),
        description: z
          .string()
          .nullable()
          .optional()
          .transform(v => v ?? ''),
      })
    )
    .min(1, 'At least one item is required'),
});

type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

interface PurchaseRequestFormProps {
  purchaseRequest?: PurchaseRequest;
  onSubmit: (data: PurchaseRequestFormData, sendForApproval: boolean) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
  purchaseRequest,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>(
    {}
  );
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState<Record<number, boolean>>({});
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Excel Import State
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<boolean>(false);

  const { data: departments = [] } = useDepartmentsList();
  const { data: cities = [], isLoading: citiesLoading } = useCities();

  const currentSearchQuery =
    activeSearchIndex !== null ? searchQueries[activeSearchIndex] || '' : '';
  const { data: searchResults = [] } = useItemSearch(
    currentSearchQuery,
    activeSearchIndex !== null && currentSearchQuery.length > 0
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: purchaseRequest || {
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: AuthService.getUserFullName(),
      departmentId: undefined,
      locationId: undefined,
      purchaseType: '',
      projectCode: '',
      projectName: '',
      remarks: '',
      items: [
        {
          itemId: 0,
          categoryId: 0,
          categoryName: '',
          subCategoryId: 0,
          subCategoryName: '',
          modelName: '',
          make: '',
          uomId: 0,
          uomName: '',
          quantity: 1,
          unitPrice: 0,
          description: '',
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  });

  // Reset form when purchaseRequest prop changes
  useEffect(() => {
    if (purchaseRequest) {
      const headerValues = {
        requestDate:
          purchaseRequest.requestDate || new Date().toISOString().split('T')[0],
        requestedBy:
          purchaseRequest.requestedBy || AuthService.getUserFullName(),
        departmentId: purchaseRequest.departmentId,
        locationId: purchaseRequest.locationId,
        purchaseType: purchaseRequest.purchaseType || '',
        projectCode: purchaseRequest.projectCode || '',
        projectName: purchaseRequest.projectName || '',
        remarks: purchaseRequest.remarks || '',
      };

      reset({
        ...headerValues,
        items: [],
      });

      if (purchaseRequest.items && purchaseRequest.items.length > 0) {
        const mappedItems = purchaseRequest.items.map(item => ({
          id: item.id,
          itemId: item.itemId || 0,
          categoryId: item.categoryId || 0,
          categoryName: item.categoryName || '',
          subCategoryId: item.subCategoryId || 0,
          subCategoryName: item.subCategoryName || '',
          modelName: item.modelName || '',
          make: item.make || '',
          uomId: item.uomId || 0,
          uomName: item.uomName || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice:
            item.totalPrice || (item.quantity || 0) * (item.unitPrice || 0),
          description: item.description || '',
          rmApprovalStatus: item.rmApprovalStatus,
          approvalRemarks: item.approvalRemarks,
        }));

        replace(mappedItems);

        const newSearchQueries: Record<number, string> = {};
        purchaseRequest.items.forEach((item, index) => {
          newSearchQueries[index] = item.modelName || '';
        });
        setSearchQueries(newSearchQueries);
      }
    }
  }, [purchaseRequest, reset, replace]);

  // Auto-fill Location and Department for new PRs
  useEffect(() => {
    if (!purchaseRequest) {
      const user = AuthService.getStoredUser();
      if (user) {
        if (user.departmentName && departments.length > 0) {
          const matchedDept = departments.find(
            d => d.name.toLowerCase() === user.departmentName?.toLowerCase()
          );
          if (matchedDept && matchedDept.id) {
            setValue('departmentId', matchedDept.id);
          }
        }
        if (user.locationName && cities.length > 0) {
          const matchedLoc = cities.find(
            c => c.name.toLowerCase() === user.locationName?.toLowerCase()
          );
          if (matchedLoc && matchedLoc.id) {
            setValue('locationId', matchedLoc.id);
          }
        }
      }
    }
  }, [departments, cities, setValue, purchaseRequest]);

  const items = watch('items');

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => {
    const total = (item.quantity || 0) * (item.unitPrice || 0);
    return sum + total;
  }, 0);

  // Handle item search input
  const handleSearchInput = (index: number, value: string) => {
    setSearchQueries(prev => ({ ...prev, [index]: value }));
    setActiveSearchIndex(index);
    setShowDropdown(prev => ({ ...prev, [index]: true }));
  };

  // Handle item selection from dropdown
  const handleItemSelect = (
    index: number,
    item: PurchaseRequestItemFormData
  ) => {
    setValue(`items.${index}.itemId`, item.id);
    setValue(`items.${index}.categoryId`, item.categoryId);
    setValue(`items.${index}.categoryName`, item.categoryName);
    setValue(`items.${index}.subCategoryId`, item.subCategoryId);
    setValue(`items.${index}.subCategoryName`, item.subCategoryName);
    setValue(`items.${index}.modelName`, item.displayName);
    setValue(`items.${index}.make`, item.make);
    setValue(`items.${index}.uomId`, item.uomId);
    setValue(`items.${index}.uomName`, item.uomName);

    setSearchQueries(prev => ({ ...prev, [index]: item.displayName }));
    setShowDropdown(prev => ({ ...prev, [index]: false }));
    setActiveSearchIndex(null);
  };

  // Calculate line total
  const calculateLineTotal = (index: number) => {
    const quantity = items[index]?.quantity || 0;
    const unitPrice = items[index]?.unitPrice || 0;
    return (quantity * unitPrice).toFixed(2);
  };

  // Handle delete line item
  const handleDeleteItem = (index: number) => {
    remove(index);
    setSearchQueries(prev => {
      const newQueries: Record<number, string> = {};
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex < index) {
          newQueries[oldIndex] = prev[oldIndex];
        } else if (oldIndex > index) {
          newQueries[oldIndex - 1] = prev[oldIndex];
        }
      });
      return newQueries;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        ref => ref && !ref.contains(event.target as Node)
      );
      if (clickedOutside) {
        setShowDropdown({});
        setActiveSearchIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (sendForApproval: boolean) => {
    handleSubmit(
      data => {
        if (sendForApproval) {
          setPendingSubmission(true);
          setShowConfirmDialog(true);
        } else {
          onSubmit(data, sendForApproval);
        }
      },
      errors => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        if (errors.items?.root) {
          toast.error(
            errors.items.root.message || 'At least one item is required'
          );
        } else if (errors.items?.message) {
          toast.error(errors.items.message);
        } else if (errors.items) {
          const itemErrors = Object.entries(errors.items)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([idx, err]: [string, any]) => {
              const fieldErrors = Object.entries(err || {})
                .map(([field, e]: [string, any]) => `${field}: ${e?.message}`)
                .join(', ');
              return `Item ${Number(idx) + 1}: ${fieldErrors}`;
            });
          if (itemErrors.length > 0) {
            toast.error(itemErrors[0]);
          } else {
            toast.error('Please check the items for errors');
          }
        } else {
          const firstError = Object.values(errors)[0];
          toast.error(
            firstError?.message?.toString() ||
              'Please check the form for errors'
          );
        }
      }
    )();
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    setTimeout(() => {
      handleSubmit(data => onSubmit(data, true))();
    }, 100);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setPendingSubmission(false);
  };

  // Handle Excel template download
  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
  };

  // Handle Excel file processing
  const processExcelFile = async (file: File) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid Excel file (.xls or .xlsx)');
    }

    try {
      const excelItems = await parseExcelFile(file);
      const validation = validateLineItems(excelItems);
      if (!validation.valid) {
        throw new Error(validation.errors.join('\n'));
      }

      const mappedItems = await searchAndMapExcelItemsInBatch(excelItems);
      replace(mappedItems);

      const newSearchQueries: Record<number, string> = {};
      mappedItems.forEach((item, index) => {
        newSearchQueries[index] = item.modelName || '';
      });
      setSearchQueries(newSearchQueries);

      return mappedItems;
    } catch (error) {
      console.error('Excel processing error:', error);
      throw error;
    }
  };

  const searchAndMapExcelItemsInBatch = async (excelItems: ExcelLineItem[]) => {
    const BATCH_SIZE = 10;
    const mappedItems: PurchaseRequestItem[] = [];

    for (let i = 0; i < excelItems.length; i += BATCH_SIZE) {
      const batch = excelItems.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async excelItem => {
        try {
          const response = await apiClient.get(
            `/master/items/search?query=${encodeURIComponent(excelItem.model)}`
          );
          const searchResults = response.data;

          let matchedItem: PurchaseRequestItem | null = null;
          if (searchResults && searchResults.length > 0) {
            matchedItem = searchResults.find(
              (item: PurchaseRequestItemFormData) =>
                item.displayName?.toLowerCase() ===
                  excelItem.model.toLowerCase() ||
                item.modelName?.toLowerCase() === excelItem.model.toLowerCase()
            );

            if (!matchedItem) {
              matchedItem = searchResults[0];
            }
          }

          if (matchedItem) {
            return {
              itemId: matchedItem.id || 0,
              categoryId: matchedItem.categoryId || 0,
              categoryName: matchedItem.categoryName || '',
              subCategoryId: matchedItem.subCategoryId || 0,
              subCategoryName: matchedItem.subCategoryName || '',
              modelName: matchedItem.modelName || '',
              make: matchedItem.make || '',
              uomId: matchedItem.uomId || 0,
              uomName: matchedItem.uomName || '',
              quantity: excelItem.quantity,
              unitPrice: excelItem.unitPrice,
              description: excelItem.description,
            } as PurchaseRequestItem;
          } else {
            return {
              itemId: 0,
              categoryId: 0,
              categoryName: excelItem.category || '',
              subCategoryId: 0,
              subCategoryName: excelItem.subCategory || '',
              modelName: excelItem.model,
              make: excelItem.make || '',
              uomId: 0,
              uomName: excelItem.uom || '',
              quantity: excelItem.quantity,
              unitPrice: excelItem.unitPrice,
              description: excelItem.description,
            } as PurchaseRequestItem;
          }
        } catch (error) {
          console.error(`Error searching for item: ${excelItem.model}`, error);
          return {
            itemId: 0,
            categoryId: 0,
            categoryName: excelItem.category || '',
            subCategoryId: 0,
            subCategoryName: excelItem.subCategory || '',
            modelName: excelItem.model,
            make: excelItem.make || '',
            uomId: 0,
            uomName: excelItem.uom || '',
            quantity: excelItem.quantity,
            unitPrice: excelItem.unitPrice,
            description: excelItem.description,
          } as PurchaseRequestItem;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      mappedItems.push(...batchResults);
    }

    return mappedItems;
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      {/* Page Content */}
      <div className=''>
        {/* Page Header - Cashfree Style (Title + Buttons on same line, no background) */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={onCancel}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
              disabled={isSubmitting}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Create Purchase Request
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => handleFormSubmit(false)}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Save as Draft
            </button>
            <button
              type='button'
              onClick={() => handleFormSubmit(true)}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Submit
            </button>
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
          }}
          className='space-y-6'
        >
          {/* Header Information Card */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
                {/* Request Date */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Request Date
                  </label>
                  <div className='relative'>
                    <input
                      type='date'
                      {...register('requestDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.requestDate
                          ? 'border-red-400'
                          : 'border-gray-200'
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.requestDate && (
                    <p className='mt-1.5 text-sm text-red-500'>
                      {errors.requestDate.message}
                    </p>
                  )}
                </div>

                {/* Requestor */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Requestor
                  </label>
                  <input
                    {...register('requestedBy')}
                    className={`w-full px-4 py-3 text-sm border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.requestedBy ? 'border-red-400' : 'border-gray-200'
                    }`}
                    disabled={isSubmitting}
                    placeholder='Enter requestor name'
                  />
                  {errors.requestedBy && (
                    <p className='mt-1.5 text-sm text-red-500'>
                      {errors.requestedBy.message}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Location
                  </label>
                  <div className='relative'>
                    <Controller
                      name='locationId'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          className={`w-full px-4 py-3 text-sm border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors.locationId
                              ? 'border-red-400'
                              : 'border-gray-200'
                          }`}
                          disabled={isSubmitting || citiesLoading}
                        >
                          <option value=''>
                            {citiesLoading ? 'Loading...' : 'Select Location'}
                          </option>
                          {cities.map(city => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                  </div>
                  {errors.locationId && (
                    <p className='mt-1.5 text-sm text-red-500'>
                      {errors.locationId.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Department
                  </label>
                  <div className='relative'>
                    <Controller
                      name='departmentId'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          className={`w-full px-4 py-3 text-sm border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors.departmentId
                              ? 'border-red-400'
                              : 'border-gray-200'
                          }`}
                          disabled={isSubmitting}
                        >
                          <option value=''>Select</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                  </div>
                  {errors.departmentId && (
                    <p className='mt-1.5 text-sm text-red-500'>
                      {errors.departmentId.message}
                    </p>
                  )}
                </div>

                {/* Purchase Type */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Purchase Type
                  </label>
                  <div className='relative'>
                    <select
                      {...register('purchaseType')}
                      className={`w-full px-4 py-3 text-sm border rounded-lg bg-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.purchaseType
                          ? 'border-red-400'
                          : 'border-gray-200'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value=''>Select Purchase Type</option>
                      <option value='Product'>Product</option>
                      <option value='Service'>Service</option>
                    </select>
                    <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                  </div>
                  {errors.purchaseType && (
                    <p className='mt-1.5 text-sm text-red-500'>
                      {errors.purchaseType.message}
                    </p>
                  )}
                </div>

                {/* Project Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Project Name
                  </label>
                  <input
                    {...register('projectName')}
                    className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.projectName ? 'border-red-400' : 'border-gray-200'
                    }`}
                    disabled={isSubmitting}
                    placeholder='Enter project name'
                  />
                  {errors.projectName && (
                    <p className='mt-1.5 text-sm text-red-500'>
                      {errors.projectName.message}
                    </p>
                  )}
                </div>

                {/* Justification */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Justification
                  </label>
                  <textarea
                    {...register('remarks')}
                    rows={3}
                    className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
                      errors.remarks ? 'border-red-400' : 'border-gray-200'
                    }`}
                    disabled={isSubmitting}
                    placeholder='Enter justification for this request...'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Details Section Header - Cashfree Style */}
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-base font-semibold text-gray-900'>
              Item Details
            </h2>
            <div className='flex items-center gap-3'>
              {/* Download Template Button */}
              <button
                type='button'
                onClick={handleDownloadTemplate}
                disabled={isSubmitting}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50'
              >
                <Download size={15} />
                Download Template
              </button>

              {/* Upload Excel Button */}
              <button
                type='button'
                onClick={() => setIsImportDialogOpen(true)}
                disabled={isSubmitting}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50'
              >
                <Upload size={15} />
                Upload Excel
              </button>

              {/* Add Line Item Button */}
              <button
                type='button'
                onClick={() =>
                  append({
                    itemId: 0,
                    categoryId: 0,
                    categoryName: '',
                    subCategoryId: 0,
                    subCategoryName: '',
                    modelName: '',
                    make: '',
                    uomId: 0,
                    uomName: '',
                    quantity: 1,
                    unitPrice: 0,
                    description: '',
                  })
                }
                disabled={isSubmitting}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50'
              >
                <Plus size={15} />
                Add Row
              </button>
            </div>
          </div>

          {/* Item Details Table Card */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-[#fafbfc]'>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide w-16'>
                      S.No
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide min-w-[180px]'>
                      Model
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide min-w-[120px]'>
                      Make
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide min-w-[120px]'>
                      Category
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide min-w-[120px]'>
                      Sub Category
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide w-20'>
                      UOM
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide min-w-[150px]'>
                      Description
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide w-24'>
                      Quantity
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide w-28'>
                      Unit Price
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide w-28'>
                      Total
                    </th>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide w-20'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {fields.map((field, index) => {
                    const isAccepted =
                      purchaseRequest?.items?.[index]?.rmApprovalStatus ===
                      'Accepted';
                    return (
                      <tr
                        key={field.id}
                        className={`${isAccepted ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td className='px-4 py-3 text-sm text-gray-600 font-medium'>
                          {index + 1}
                        </td>
                        <td className='px-4 py-3 relative'>
                          <div
                            ref={el => {
                              dropdownRefs.current[index] = el;
                            }}
                          >
                            <div className='relative'>
                              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                              <input
                                type='text'
                                value={searchQueries[index] || ''}
                                onChange={e =>
                                  handleSearchInput(index, e.target.value)
                                }
                                placeholder='Type to search...'
                                className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white'
                                disabled={isSubmitting}
                              />
                            </div>
                            {showDropdown[index] &&
                              searchResults.length > 0 && (
                                <div className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                  {searchResults.map(item => (
                                    <div
                                      key={item.id}
                                      onClick={() =>
                                        handleItemSelect(index, item)
                                      }
                                      className='px-3 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm border-b border-gray-100 last:border-0'
                                    >
                                      <div className='font-medium text-gray-900'>
                                        {item.displayName}
                                      </div>
                                      <div className='text-xs text-gray-500 mt-0.5'>
                                        {item.categoryName} •{' '}
                                        {item.subCategoryName}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            {...register(`items.${index}.make`)}
                            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500'
                            disabled
                          />
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          <Controller
                            name={`items.${index}.categoryName`}
                            control={control}
                            render={({ field }) => (
                              <span>{field.value || '-'}</span>
                            )}
                          />
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          <Controller
                            name={`items.${index}.subCategoryName`}
                            control={control}
                            render={({ field }) => (
                              <span>{field.value || '-'}</span>
                            )}
                          />
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          <Controller
                            name={`items.${index}.uomName`}
                            control={control}
                            render={({ field }) => (
                              <span>{field.value || '-'}</span>
                            )}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            {...register(`items.${index}.description`)}
                            className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isAccepted ? 'bg-gray-100' : 'bg-white'}`}
                            disabled={isSubmitting || isAccepted}
                            placeholder='Description'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <Controller
                            name={`items.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type='number'
                                min='1'
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                                className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isAccepted ? 'bg-gray-100' : 'bg-white'}`}
                                disabled={isSubmitting || isAccepted}
                              />
                            )}
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <Controller
                            name={`items.${index}.unitPrice`}
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type='number'
                                min='0'
                                step='0.01'
                                onChange={e =>
                                  field.onChange(Number(e.target.value))
                                }
                                className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isAccepted ? 'bg-gray-100' : 'bg-white'}`}
                                disabled={isSubmitting || isAccepted}
                              />
                            )}
                          />
                        </td>
                        <td className='px-4 py-3 text-right text-sm font-medium text-gray-900'>
                          {calculateLineTotal(index)}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            type='button'
                            onClick={() => handleDeleteItem(index)}
                            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={isSubmitting || isAccepted}
                            title={
                              isAccepted
                                ? 'Cannot delete accepted items'
                                : 'Delete item'
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Grand Total Row */}
              <div className='px-6 py-4 bg-white border-t border-gray-200 flex justify-end'>
                <div className='flex items-center gap-8'>
                  <span className='text-sm font-semibold text-gray-600'>
                    Grand Total
                  </span>
                  <span className='text-lg font-bold text-gray-900'>
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {errors.items && (
              <p className='px-6 pb-4 text-sm text-red-500'>
                {errors.items.message}
              </p>
            )}
          </div>

          {/* Total Amount Footer */}
          <div className='flex justify-end'>
            <div className='bg-white rounded-lg border border-gray-200 px-6 py-4'>
              <div className='flex items-center gap-4'>
                <span className='text-sm font-medium text-gray-600'>
                  Total Amount:
                </span>
                <span className='text-xl font-bold text-violet-600'>
                  {grandTotal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={open => setShowConfirmDialog(open)}
        title='Confirm Submission'
        description='Are you sure you want to submit this purchase request for approval?'
        confirmText='Submit'
        onConfirm={handleConfirmSubmit}
        loading={isSubmitting}
      />

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        entityName='Line Items'
        onFileData={processExcelFile}
        onTemplateDownload={handleDownloadTemplate}
        onImportSuccess={() => {}}
      />
    </div>
  );
};

export default PurchaseRequestForm;
