import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { AlertDialog } from '@/components/ui/Dialog';
import type { PurchaseRequest, PurchaseRequestItem } from '../types';
import { useItemSearch } from '../hooks/useItemSearch';
import { useDepartmentsList } from '@/features/master/hooks/useDepartmentAPI';
import { useFloors } from '@/features/master/hooks/useFloorAPI';
import { AuthService } from '@/services/auth';
import {
  downloadExcelTemplate,
  parseExcelFile,
  validateLineItems,
  type ExcelLineItem,
} from '../utils/excelUtils';
import { apiClient } from '@/lib/api';

const purchaseRequestSchema = z.object({
  requestDate: z.string().min(1, 'Request date is required'),
  requestedBy: z.string().min(1, 'Requestor is required'),
  departmentId: z.number().min(1, 'Department is required'),
  locationId: z.number().min(1, 'Location is required'),
  purchaseType: z.string().min(1, 'Purchase Type is required'),
  projectCode: z.string().min(1, 'Project Code is required'),
  projectName: z.string().min(1, 'Project Name is required'),
  remarks: z.string().optional(),
  items: z
    .array(
      z.object({
        itemId: z.number().min(0, 'Item ID must be valid'),
        categoryId: z.number(),
        categoryName: z.string().optional(),
        subCategoryId: z.number(),
        subCategoryName: z.string().optional(),
        modelName: z.string().optional(),
        make: z.string().optional(),
        uomId: z.number().optional(),
        uomName: z.string().optional(),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().optional(),
        description: z.string().optional(),
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
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<boolean>(false);

  const { data: departments = [] } = useDepartmentsList();
  const { data: floors = [] } = useFloors();

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
      // Debug logging to see what data we're receiving
      console.log('=== PR Edit Data Received ===');
      console.log('Full PR:', purchaseRequest);
      console.log('Items:', purchaseRequest.items);
      if (purchaseRequest.items && purchaseRequest.items.length > 0) {
        console.log('First item fields:', purchaseRequest.items[0]);
      }
      console.log('=============================');

      // Reset only header fields (not items)
      const headerValues = {
        requestDate: purchaseRequest.requestDate || new Date().toISOString().split('T')[0],
        requestedBy: purchaseRequest.requestedBy || AuthService.getUserFullName(),
        departmentId: purchaseRequest.departmentId,
        locationId: purchaseRequest.locationId,
        purchaseType: purchaseRequest.purchaseType || '',
        projectCode: purchaseRequest.projectCode || '',
        projectName: purchaseRequest.projectName || '',
        remarks: purchaseRequest.remarks || '',
      };

      // Reset header values (excluding items to avoid conflict)
      reset({
        ...headerValues,
        items: [], // Temporarily set empty, will be replaced below
      });

      // Replace items array separately with all required fields
      if (purchaseRequest.items && purchaseRequest.items.length > 0) {
        // Map items to ensure all fields are present
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
          totalPrice: item.totalPrice || (item.quantity || 0) * (item.unitPrice || 0),
          description: item.description || '',
          rmApprovalStatus: item.rmApprovalStatus,
          approvalRemarks: item.approvalRemarks,
        }));

        console.log('Mapped items for form:', mappedItems);
        replace(mappedItems);

        // Populate search queries with model names so they appear in the input fields
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
    if (!purchaseRequest) { // Only for new PRs
      const user = AuthService.getStoredUser();
      console.log("Auto-fill Debug: User Data:", user);
      console.log("Auto-fill Debug: Departments:", departments);
      console.log("Auto-fill Debug: Locations:", floors);
      if (user) {
        // Auto-fill Department
        if (user.departmentName && departments.length > 0) {
          const matchedDept = departments.find(
            d => d.name.toLowerCase() === user.departmentName?.toLowerCase()
          );
          if (matchedDept && matchedDept.id) {
            setValue('departmentId', matchedDept.id);
          }
        }
        // Auto-fill Location
        if (user.locationName && floors.length > 0) {
          const matchedLoc = floors.find(
            f => f.name.toLowerCase() === user.locationName?.toLowerCase()
          );
          if (matchedLoc && matchedLoc.id) {
            setValue('locationId', matchedLoc.id);
          }
        }
      }
    }
  }, [departments, floors, setValue, purchaseRequest]);

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
  const handleItemSelect = (index: number, item: any) => {
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
    // Remove the item from form array
    remove(index);

    // Clean up search queries - rebuild the object with adjusted indices
    setSearchQueries(prev => {
      const newQueries: Record<number, string> = {};
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex < index) {
          // Keep indices before deleted item as-is
          newQueries[oldIndex] = prev[oldIndex];
        } else if (oldIndex > index) {
          // Shift indices after deleted item down by 1
          newQueries[oldIndex - 1] = prev[oldIndex];
        }
        // Skip the deleted index
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
    if (sendForApproval) {
      // Show confirmation dialog for submit
      setPendingSubmission(true);
      setShowConfirmDialog(true);
    } else {
      // No confirmation needed for draft
      handleSubmit(data => onSubmit(data, sendForApproval))();
    }
  };

  const handleConfirmSubmit = () => {
    // Close dialog first
    setShowConfirmDialog(false);
    // Then submit the form
    setTimeout(() => {
      handleSubmit(data => onSubmit(data, true))();
    }, 100);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setPendingSubmission(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelSubmit();
    }
  };

  // Handle Excel template download
  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
  };

  // Handle Excel file upload
  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xls or .xlsx)');
      return;
    }

    setIsUploadingExcel(true);

    try {
      // Parse Excel file
      const excelItems = await parseExcelFile(file);

      // Validate items
      const validation = validateLineItems(excelItems);
      if (!validation.valid) {
        validation.errors.forEach(error => toast.error(error));
        setIsUploadingExcel(false);
        return;
      }

      // Search and map items with progress
      const mappedItems = await searchAndMapExcelItemsInBatch(excelItems);

      // Replace all existing items with new Excel items
      replace(mappedItems);

      // Clear and populate search queries for the new items
      const newSearchQueries: Record<number, string> = {};
      mappedItems.forEach((item, index) => {
        // Set the model name in search queries so it appears in the Model input field
        newSearchQueries[index] = item.modelName || '';
      });
      setSearchQueries(newSearchQueries);

      toast.success(
        `Successfully imported ${mappedItems.length} line items from Excel!`
      );
    } catch (error) {
      console.error('Excel upload error:', error);
      toast.error(`Failed to process Excel file: ${error}`);
    } finally {
      setIsUploadingExcel(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Optimized batch processing with parallel requests and progress tracking
  const searchAndMapExcelItemsInBatch = async (excelItems: ExcelLineItem[]) => {
    const BATCH_SIZE = 10; // Process 10 items in parallel
    const mappedItems: PurchaseRequestItem[] = [];

    setUploadProgress({ current: 0, total: excelItems.length });

    // Process items in batches
    for (let i = 0; i < excelItems.length; i += BATCH_SIZE) {
      const batch = excelItems.slice(i, i + BATCH_SIZE);

      // Process all items in this batch in parallel
      const batchPromises = batch.map(async excelItem => {
        try {
          // Search for the item by model name
          const response = await apiClient.get(
            `/master/items/search?query=${encodeURIComponent(excelItem.model)}`
          );
          const searchResults = response.data;

          // Find exact or best match
          let matchedItem: any = null;
          if (searchResults && searchResults.length > 0) {
            // Try to find exact match first (case-insensitive)
            matchedItem = searchResults.find(
              (item: any) =>
                item.displayName?.toLowerCase() ===
                excelItem.model.toLowerCase() ||
                item.modelName?.toLowerCase() === excelItem.model.toLowerCase()
            );

            // If no exact match, use first result
            if (!matchedItem) {
              matchedItem = searchResults[0];
            }
          }

          if (matchedItem) {
            // Item found in system - use system data
            return {
              itemId: matchedItem.id || 0,
              categoryId: matchedItem.categoryId || 0,
              categoryName: matchedItem.categoryName || '',
              subCategoryId: matchedItem.subCategoryId || 0,
              subCategoryName: matchedItem.subCategoryName || '',
              modelName: matchedItem.displayName || '',
              make: matchedItem.make || '',
              uomId: matchedItem.uomId || 0,
              uomName: matchedItem.uomName || '',
              quantity: excelItem.quantity,
              unitPrice: excelItem.unitPrice,
              description: excelItem.description,
            } as PurchaseRequestItem;
          } else {
            // Item not found - use Excel data as-is
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
          // Return item with Excel data if search fails
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

      // Wait for all items in this batch to complete
      const batchResults = await Promise.all(batchPromises);
      mappedItems.push(...batchResults);

      // Update progress
      setUploadProgress({
        current: mappedItems.length,
        total: excelItems.length,
      });
    }

    return mappedItems;
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className='bg-white rounded-lg shadow-md'>
      <div className='border-b border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={onCancel}
              className='text-gray-600 hover:text-gray-800 transition-colors'
              disabled={isSubmitting}
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className='text-2xl font-bold text-gray-800'>
              Create Purchase Request
            </h2>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => handleFormSubmit(false)}
              disabled={isSubmitting}
              className='px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400'
            >
              Save as Draft
            </button>
            <button
              type='button'
              onClick={() => handleFormSubmit(true)}
              disabled={isSubmitting}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400'
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <form className='p-6' onSubmit={(e) => { e.preventDefault(); /* Form submission is handled by buttons */ }}>
        {/* Header Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Request Date
            </label>
            <input
              type='date'
              {...register('requestDate')}
              min={new Date().toISOString().split('T')[0]}
              className={inputClass(!!errors.requestDate)}
              disabled={isSubmitting}
            />
            {errors.requestDate && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.requestDate.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Requestor
            </label>
            <input
              {...register('requestedBy')}
              className={inputClass(!!errors.requestedBy)}
              disabled={isSubmitting}
              placeholder='Enter requestor name'
            />
            {errors.requestedBy && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.requestedBy.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Location
            </label>
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
                  className={inputClass(!!errors.locationId)}
                  disabled={isSubmitting}
                >
                  <option value=''>Select Location</option>
                  {floors.map(floor => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.locationId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.locationId.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Department
            </label>
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
                  className={inputClass(!!errors.departmentId)}
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
            {errors.departmentId && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.departmentId.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Purchase Type
            </label>
            <input
              {...register('purchaseType')}
              className={inputClass(!!errors.purchaseType)}
              disabled={isSubmitting}
              placeholder='Enter purchase type'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Project Code
            </label>
            <input
              {...register('projectCode')}
              className={inputClass(!!errors.projectCode)}
              disabled={isSubmitting}
              placeholder='Enter project code'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <span className='text-red-500'>*</span> Project Name
            </label>
            <input
              {...register('projectName')}
              className={inputClass(!!errors.projectName)}
              disabled={isSubmitting}
              placeholder='Enter project name'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Justification
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              className={inputClass(!!errors.remarks)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className='border-t border-gray-200 pt-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-800'>
              Item Details
            </h3>
            <div className='flex items-center gap-2'>
              {/* Download Template Button */}
              <button
                type='button'
                onClick={handleDownloadTemplate}
                disabled={isSubmitting}
                className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400'
                title='Download Excel Template'
              >
                <Download size={18} />
                Download Template
              </button>

              {/* Upload Excel Button */}
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingExcel}
                className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400'
                title='Upload Excel File'
              >
                <Upload size={18} />
                {isUploadingExcel
                  ? `Processing ${uploadProgress.current}/${uploadProgress.total}...`
                  : 'Upload Excel'}
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls'
                onChange={handleExcelUpload}
                className='hidden'
              />

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
                    uomId: 0,
                    uomName: '',
                    quantity: 1,
                    unitPrice: 0,
                    description: '',
                  })
                }
                disabled={isSubmitting}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400'
              >
                <Plus size={18} />
                Add Line Item
              </button>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-gray-300 px-4 py-2 text-center text-sm font-semibold'>
                    S.No
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Model
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Make
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Category
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Sub Category
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    UOM
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Description
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Quantity
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
                    Total
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const isAccepted = purchaseRequest?.items?.[index]?.rmApprovalStatus === 'Accepted';
                  return (
                    <tr key={field.id} className={isAccepted ? 'bg-gray-100' : 'hover:bg-gray-50'}>
                      <td className='border border-gray-300 px-4 py-2 text-center font-medium text-gray-700'>
                        {index + 1}
                      </td>
                      <td className='border border-gray-300 px-2 py-2 relative'>
                        <div
                          ref={el => {
                            dropdownRefs.current[index] = el;
                          }}
                        >
                          <input
                            type='text'
                            value={searchQueries[index] || ''}
                            onChange={e =>
                              handleSearchInput(index, e.target.value)
                            }
                            placeholder='Type to search...'
                            className='w-full px-2 py-1 border rounded text-sm'
                            disabled={isSubmitting}
                          />
                          {showDropdown[index] && searchResults.length > 0 && (
                            <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                              {searchResults.map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => handleItemSelect(index, item)}
                                  className='px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm'
                                >
                                  <div className='font-medium'>
                                    {item.displayName}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    {item.categoryName} - {item.subCategoryName}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='border border-gray-300 px-2 py-2'>
                        <input
                          {...register(`items.${index}.make`)}
                          className='w-full px-2 py-1 border rounded text-sm bg-gray-50'
                          disabled
                        />
                      </td>
                      <td className='border border-gray-300 px-2 py-2 text-sm'>
                        <Controller
                          name={`items.${index}.categoryName`}
                          control={control}
                          render={({ field }) => (
                            <span className='text-gray-700'>
                              {field.value || '-'}
                            </span>
                          )}
                        />
                      </td>
                      <td className='border border-gray-300 px-2 py-2 text-sm'>
                        <Controller
                          name={`items.${index}.subCategoryName`}
                          control={control}
                          render={({ field }) => (
                            <span className='text-gray-700'>
                              {field.value || '-'}
                            </span>
                          )}
                        />
                      </td>
                      <td className='border border-gray-300 px-2 py-2 text-sm'>
                        <Controller
                          name={`items.${index}.uomName`}
                          control={control}
                          render={({ field }) => (
                            <span className='text-gray-700'>
                              {field.value || '-'}
                            </span>
                          )}
                        />
                      </td>
                      <td className='border border-gray-300 px-2 py-2'>
                        <input
                          {...register(`items.${index}.description`)}
                          className={`w-full px-2 py-1 border rounded text-sm ${isAccepted ? 'bg-gray-100' : ''}`}
                          disabled={isSubmitting || isAccepted}
                        />
                      </td>
                      <td className='border border-gray-300 px-2 py-2'>
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
                              className={`w-20 px-2 py-1 border rounded text-sm ${isAccepted ? 'bg-gray-100' : ''}`}
                              disabled={isSubmitting || isAccepted}
                            />
                          )}
                        />
                      </td>
                      <td className='border border-gray-300 px-2 py-2'>
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
                              className={`w-24 px-2 py-1 border rounded text-sm ${isAccepted ? 'bg-gray-100' : ''}`}
                              disabled={isSubmitting || isAccepted}
                            />
                          )}
                        />
                      </td>
                      <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900'>
                        {calculateLineTotal(index)}
                      </td>
                      <td className='px-4 py-2 whitespace-nowrap text-sm'>
                        {/* Display status if available (from existing PR) */}
                        {purchaseRequest?.items?.[index]?.rmApprovalStatus && (
                          <div className='flex flex-col'>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${purchaseRequest.items[index].rmApprovalStatus === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : purchaseRequest.items[index].rmApprovalStatus === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {purchaseRequest.items[index].rmApprovalStatus}
                            </span>
                            {purchaseRequest.items[index].approvalRemarks && (
                              <span className='text-xs text-red-600 mt-1'>
                                {purchaseRequest.items[index].approvalRemarks}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className='px-4 py-2 whitespace-nowrap text-center'>
                        <button
                          type='button'
                          onClick={() => handleDeleteItem(index)}
                          className='text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed'
                          disabled={isSubmitting || isAccepted}
                          title={isAccepted ? 'Cannot delete accepted items' : 'Delete item'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className='bg-gray-100'>
                  <td
                    colSpan={8}
                    className='border border-gray-300 px-4 py-2 text-right font-semibold'
                  >
                    Grand Total
                  </td>
                  <td className='border border-gray-300 px-4 py-2 text-right font-bold text-lg'>
                    ₹{grandTotal.toFixed(2)}
                  </td>
                  <td className='border border-gray-300'></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {errors.items && (
            <p className='mt-2 text-sm text-red-600'>{errors.items.message}</p>
          )}
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={handleDialogOpenChange}
        title='Confirm Submission'
        description='Are you sure you want to submit this Purchase Requisition?'
        confirmText='Yes, Submit'
        cancelText='Cancel'
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        loading={isSubmitting}
      />
    </div>
  );
};

export default PurchaseRequestForm;
