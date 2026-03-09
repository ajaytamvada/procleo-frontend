import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  ChevronDown,
  Search,
  X,
  ArrowRight,
  ShoppingCart,
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
import CatalogBrowserPage from '@/features/catalog/pages/CatalogBrowsePage';

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
  projectName: z.string().optional(),
  remarks: z.string().optional(),
  attachments: z.string().optional(),
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
        vendorId: z.number().nullable().optional(),
        catalogItemId: z.number().nullable().optional(),
        contractId: z.number().nullable().optional(),
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
  const [currentStep, setCurrentStep] = useState<'header' | 'catalog'>(
    'header'
  );
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>(
    {}
  );
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(
    null
  );
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    trigger,
  } = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema) as any,
    defaultValues: purchaseRequest || {
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: AuthService.getUserFullName(),
      departmentId: undefined,
      locationId: undefined,
      purchaseType: '',
      projectCode: '',
      projectName: '',
      remarks: '',
      attachments: '',
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

  const purchaseType = watch('purchaseType');
  const isCatalogFlow = purchaseType === 'CATALOG';
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  });

  useEffect(() => {
    if (purchaseRequest) {
      reset({
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
        attachments: purchaseRequest.attachments || '',
        items: [],
      });
      if (purchaseRequest.items?.length) {
        replace(
          purchaseRequest.items.map(item => ({
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
            description: item.description || '',
          })) as any
        );
        const newSearchQueries: Record<number, string> = {};
        purchaseRequest.items.forEach((item, index) => {
          newSearchQueries[index] = item.modelName || '';
        });
        setSearchQueries(newSearchQueries);
      }
    }
  }, [purchaseRequest, reset, replace]);

  useEffect(() => {
    if (!purchaseRequest) {
      const user = AuthService.getStoredUser();
      if (user) {
        if (user.departmentName && departments.length > 0) {
          const matchedDept = departments.find(
            d => d.name.toLowerCase() === user.departmentName?.toLowerCase()
          );
          if (matchedDept?.id) setValue('departmentId', matchedDept.id);
        }
        if (user.locationName && cities.length > 0) {
          const matchedLoc = cities.find(
            c => c.name.toLowerCase() === user.locationName?.toLowerCase()
          );
          if (matchedLoc?.id) setValue('locationId', matchedLoc.id);
        }
      }
    }
  }, [departments, cities, setValue, purchaseRequest]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        ref => ref && !ref.contains(event.target as Node)
      );
      if (clickedOutside) setActiveSearchIndex(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items = watch('items');
  const grandTotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const handleSearchInput = (index: number, value: string) => {
    setSearchQueries(prev => ({ ...prev, [index]: value }));
    setActiveSearchIndex(index);
  };

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
    setActiveSearchIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    remove(index);
    setSearchQueries(prev => {
      const newQueries: Record<number, string> = {};
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex < index) newQueries[oldIndex] = prev[oldIndex];
        else if (oldIndex > index) newQueries[oldIndex - 1] = prev[oldIndex];
      });
      return newQueries;
    });
  };

  const handleNext = async () => {
    const headerValid = await trigger([
      'requestDate',
      'requestedBy',
      'departmentId',
      'locationId',
      'purchaseType',
      'projectName',
    ]);
    if (headerValid) setCurrentStep('catalog');
    else toast.error('Please fill in all required fields');
  };

  const handleCatalogSubmit = (
    catalogItems: PurchaseRequestItem[],
    sendForApproval: boolean
  ) => {
    replace(catalogItems as any);
    const formData: PurchaseRequestFormData = {
      requestDate: watch('requestDate'),
      requestedBy: watch('requestedBy'),
      departmentId: watch('departmentId'),
      locationId: watch('locationId'),
      purchaseType: watch('purchaseType'),
      projectCode: watch('projectCode'),
      projectName: watch('projectName'),
      remarks: watch('remarks'),
      attachments: watch('attachments'),
      items: catalogItems as any,
    };
    onSubmit(formData, sendForApproval);
  };

  const handleFormSubmit = (sendForApproval: boolean) => {
    handleSubmit(
      data => {
        if (sendForApproval) setShowConfirmDialog(true);
        else onSubmit(data, sendForApproval);
      },
      errors => {
        const firstError =
          errors.items?.message ||
          errors.items?.root?.message ||
          Object.values(errors)[0]?.message?.toString();
        toast.error(firstError || 'Please check the form for errors');
      }
    )();
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    setTimeout(() => handleSubmit(data => onSubmit(data, true))(), 100);
  };

  const processExcelFile = async (file: File) => {
    const excelItems = await parseExcelFile(file);
    const validation = validateLineItems(excelItems);
    if (!validation.valid) throw new Error(validation.errors.join('\n'));
    const mappedItems = await searchAndMapExcelItemsInBatch(excelItems);
    replace(mappedItems as any);
    return mappedItems;
  };

  const searchAndMapExcelItemsInBatch = async (excelItems: ExcelLineItem[]) => {
    const mappedItems: PurchaseRequestItem[] = [];
    for (const excelItem of excelItems) {
      try {
        const response = await apiClient.get(
          `/master/items/search?query=${encodeURIComponent(excelItem.model)}`
        );
        const results = response.data;
        const matchedItem =
          results?.find(
            (item: any) =>
              item.displayName?.toLowerCase() === excelItem.model.toLowerCase()
          ) || results?.[0];
        mappedItems.push({
          itemId: matchedItem?.id || 0,
          categoryId: matchedItem?.categoryId || 0,
          categoryName: matchedItem?.categoryName || excelItem.category || '',
          subCategoryId: matchedItem?.subCategoryId || 0,
          subCategoryName:
            matchedItem?.subCategoryName || excelItem.subCategory || '',
          modelName: matchedItem?.modelName || excelItem.model,
          make: matchedItem?.make || excelItem.make || '',
          uomId: matchedItem?.uomId || 0,
          uomName: matchedItem?.uomName || excelItem.uom || '',
          quantity: excelItem.quantity,
          unitPrice: excelItem.unitPrice,
          description: excelItem.description,
        } as PurchaseRequestItem);
      } catch {
        mappedItems.push({
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
        } as PurchaseRequestItem);
      }
    }
    return mappedItems;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const response = await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.data === 1 && response.data.upload_inv) {
        const currentFiles = watch('attachments') || '';
        const files = currentFiles
          ? currentFiles.split(',').filter(f => f.trim())
          : [];
        setValue('attachments', [...files, response.data.upload_inv].join(','));
        toast.success('File uploaded successfully');
      }
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (filename: string) => {
    const files = (watch('attachments') || '')
      .split(',')
      .filter(f => f.trim() && f !== filename);
    setValue('attachments', files.join(','));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    return '📎';
  };

  // CATALOG FLOW: Full-page catalog browser
  if (isCatalogFlow && currentStep === 'catalog') {
    return (
      <CatalogBrowserPage
        onBack={() => setCurrentStep('header')}
        onSubmit={handleCatalogSubmit}
        headerData={{
          requestDate: watch('requestDate'),
          requestedBy: watch('requestedBy'),
          departmentId: watch('departmentId'),
          locationId: watch('locationId'),
          purchaseType: watch('purchaseType'),
          projectCode: watch('projectCode'),
          projectName: watch('projectName'),
          remarks: watch('remarks'),
          attachments: watch('attachments'),
        }}
        isSubmitting={isSubmitting}
      />
    );
  }

  // HEADER FORM
  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onCancel}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg'
            disabled={isSubmitting}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className='text-xl font-semibold text-gray-900'>
            Create Purchase Request
          </h1>
        </div>
        <div className='flex items-center gap-3'>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileSelect}
            className='hidden'
          />
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className='inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50'
          >
            {isUploading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600' />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Attach Files
              </>
            )}
          </button>
          {isCatalogFlow ? (
            <button
              type='button'
              onClick={handleNext}
              className='inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700'
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                type='button'
                onClick={() => handleFormSubmit(false)}
                disabled={isSubmitting}
                className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50'
              >
                Save as Draft
              </button>
              <button
                type='button'
                onClick={() => handleFormSubmit(true)}
                disabled={isSubmitting}
                className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50'
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Attached Files */}
      {(() => {
        const files = (watch('attachments') || '')
          .split(',')
          .filter(f => f.trim());
        return (
          files.length > 0 && (
            <div className='mb-3 flex gap-1.5 overflow-x-auto pb-1'>
              {files.map((filename, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-md flex-shrink-0 min-w-[150px] max-w-[250px]'
                >
                  <span className='text-base'>{getFileIcon(filename)}</span>
                  <span className='text-[11px] font-medium text-gray-700 truncate flex-1'>
                    {filename}
                  </span>
                  <button
                    type='button'
                    onClick={() => removeFile(filename)}
                    className='p-1 text-gray-400 hover:text-red-500 rounded'
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )
        );
      })()}

      <form onSubmit={e => e.preventDefault()} className='space-y-6'>
        {/* Header Card */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Request Date
              </label>
              <input
                type='date'
                {...register('requestDate')}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 ${errors.requestDate ? 'border-red-400' : 'border-gray-200'}`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Requestor
              </label>
              <input
                {...register('requestedBy')}
                className={`w-full px-4 py-3 text-sm border rounded-lg bg-gray-50 focus:ring-2 focus:ring-violet-500 ${errors.requestedBy ? 'border-red-400' : 'border-gray-200'}`}
                disabled={isSubmitting}
              />
            </div>
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
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className={`w-full px-4 py-3 text-sm border rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 ${errors.locationId ? 'border-red-400' : 'border-gray-200'}`}
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
            </div>
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
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className={`w-full px-4 py-3 text-sm border rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 ${errors.departmentId ? 'border-red-400' : 'border-gray-200'}`}
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
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Purchase Type
              </label>
              <div className='relative'>
                <select
                  {...register('purchaseType')}
                  className={`w-full px-4 py-3 text-sm border rounded-lg appearance-none focus:ring-2 focus:ring-violet-500 ${errors.purchaseType ? 'border-red-400' : 'border-gray-200'}`}
                  disabled={isSubmitting}
                >
                  <option value=''>Select Purchase Type</option>
                  <option value='PURCHASE_ORDER'>
                    Purchase Order (Standard)
                  </option>
                  <option value='PURCHASE_AGREEMENT'>
                    Purchase Agreement (Contract)
                  </option>
                  <option value='CATALOG'>Catalog (Auto-PO)</option>
                </select>
                <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Project Name
              </label>
              <input
                {...register('projectName')}
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 ${errors.projectName ? 'border-red-400' : 'border-gray-200'}`}
                disabled={isSubmitting}
                placeholder='Enter project name'
              />
            </div>
            <div className='md:col-span-3'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Justification
              </label>
              <textarea
                {...register('remarks')}
                rows={3}
                className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none'
                disabled={isSubmitting}
                placeholder='Enter justification...'
              />
            </div>
          </div>
        </div>

        {/* Catalog Info Banner */}
        {isCatalogFlow && (
          <div className='bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-center gap-3'>
            <div className='p-2 bg-violet-100 rounded-lg'>
              <ShoppingCart size={20} className='text-violet-600' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-violet-900'>
                Catalog Purchase
              </h3>
              <p className='text-sm text-violet-700'>
                Click "Next" to browse and select items from the catalog.
              </p>
            </div>
          </div>
        )}

        {/* Item Details - Only for non-Catalog */}
        {!isCatalogFlow && (
          <>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-gray-900'>
                Item Details
              </h2>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setIsImportDialogOpen(true)}
                  disabled={isSubmitting}
                  className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50'
                >
                  <Upload size={15} />
                  Upload Excel
                </button>
                <button
                  type='button'
                  onClick={() =>
                    append({
                      itemId: 0,
                      modelName: '',
                      make: '',
                      categoryId: 0,
                      categoryName: '',
                      subCategoryId: 0,
                      subCategoryName: '',
                      uomId: 0,
                      uomName: '',
                      quantity: 1,
                      unitPrice: 0,
                      description: '',
                    } as any)
                  }
                  className='flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm'
                >
                  <Plus size={15} />
                  Add Row
                </button>
              </div>
            </div>

            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 w-16'>
                        SN
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 min-w-[180px]'>
                        Model
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 min-w-[100px]'>
                        Make
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 min-w-[100px]'>
                        Category
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 w-20'>
                        UOM
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 w-24'>
                        Qty
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 w-28'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 w-28'>
                        Total
                      </th>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-20'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {fields.map((field, index) => (
                      <tr key={field.id} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm text-gray-600'>
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
                                {...register(`items.${index}.modelName`)}
                                onChange={e =>
                                  handleSearchInput(index, e.target.value)
                                }
                                onFocus={() => setActiveSearchIndex(index)}
                                className='w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500'
                                placeholder='Search...'
                                autoComplete='off'
                              />
                              {activeSearchIndex === index &&
                                searchResults.length > 0 && (
                                  <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                    {searchResults.map(item => (
                                      <button
                                        key={item.id}
                                        type='button'
                                        onClick={() =>
                                          handleItemSelect(index, item)
                                        }
                                        className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex flex-col'
                                      >
                                        <span className='font-medium text-gray-900'>
                                          {item.modelName}
                                        </span>
                                        <span className='text-xs text-gray-500'>
                                          {item.make} • {item.categoryName}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            {...register(`items.${index}.make`)}
                            className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50'
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
                            name={`items.${index}.uomName`}
                            control={control}
                            render={({ field }) => (
                              <span>{field.value || '-'}</span>
                            )}
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
                                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg'
                                disabled={isSubmitting}
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
                                className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg'
                                disabled={isSubmitting}
                              />
                            )}
                          />
                        </td>
                        <td className='px-4 py-3 text-right text-sm font-medium text-gray-900'>
                          ₹
                          {(
                            (items[index]?.quantity || 0) *
                            (items[index]?.unitPrice || 0)
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            type='button'
                            onClick={() => handleDeleteItem(index)}
                            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg'
                            disabled={isSubmitting}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            </div>

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
          </>
        )}
      </form>

      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title='Confirm Submission'
        description='Are you sure you want to submit this purchase request for approval?'
        confirmText='Submit'
        onConfirm={handleConfirmSubmit}
        loading={isSubmitting}
      />
      <ExcelImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        entityName='Line Items'
        onFileData={processExcelFile}
        onTemplateDownload={downloadExcelTemplate}
        onImportSuccess={() => {}}
      />
    </div>
  );
};

export default PurchaseRequestForm;
