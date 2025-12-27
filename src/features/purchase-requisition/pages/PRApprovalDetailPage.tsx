/**
 * Page component for approving/rejecting PR items
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  usePRDetailsForApproval,
  useApprovePRItems,
} from '../hooks/useApproval';
import type { ApprovalItemRequest } from '../types/approval.types';
import { AuthService } from '@/services/auth';

interface EditableItem extends ApprovalItemRequest {
  itemId: number;
  modelName: string;
  description: string;
  categoryName: string;
  subCategoryName: string;
  make: string;
  uomName: string;
  originalQuantity: number;
  originalUnitPrice: number;
  originalTotalPrice: number;
}

export const PRApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prId = searchParams.get('id');

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [remarks, setRemarks] = useState('');

  // Fetch PR details
  const {
    data: prDetails,
    isLoading,
    error,
  } = usePRDetailsForApproval(prId ? parseInt(prId, 10) : 0);

  // Approve/Reject mutation
  const approveMutation = useApprovePRItems();

  // Initialize editable items when data loads
  useEffect(() => {
    if (prDetails?.items) {
      const items: EditableItem[] = prDetails.items.map(item => ({
        itemId: item.itemId,
        modelName: item.modelName,
        description: item.description,
        categoryName: item.categoryName,
        subCategoryName: item.subCategoryName,
        make: item.make,
        uomName: item.uomName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        originalQuantity: item.quantity,
        originalUnitPrice: item.unitPrice,
        originalTotalPrice: item.totalPrice,
        remarks: '',
      }));
      setEditableItems(items);

      // Select all items by default
      setSelectedItems(new Set(items.map(item => item.itemId)));
    }
  }, [prDetails]);

  // Handle select/deselect item
  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === editableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(editableItems.map(item => item.itemId)));
    }
  };

  // Update item field
  const updateItemField = (
    itemId: number,
    field: 'quantity' | 'unitPrice' | 'remarks',
    value: string | number
  ) => {
    setEditableItems(prev =>
      prev.map(item => {
        if (item.itemId === itemId) {
          const updated = { ...item, [field]: value };

          // Recalculate total price if quantity or unitPrice changed
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? Number(value) : item.quantity;
            const price =
              field === 'unitPrice' ? Number(value) : item.unitPrice;
            updated.totalPrice = qty * price;
          }

          return updated;
        }
        return item;
      })
    );
  };

  // Handle approval/rejection
  const handleSubmit = async (approvalStatus: 'Accepted' | 'Rejected') => {
    if (!prId) return;

    if (selectedItems.size === 0) {
      alert('Please select at least one item to approve/reject');
      return;
    }

    const selectedItemsData = editableItems
      .filter(item => selectedItems.has(item.itemId))
      .map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        remarks: item.remarks || undefined,
      }));

    try {
      await approveMutation.mutateAsync({
        prId: parseInt(prId, 10),
        approvalRequest: {
          prId: parseInt(prId, 10),
          approvalStatus,
          remarks: remarks || undefined,
          approvedBy: AuthService.getStoredUser()?.id
            ? String(AuthService.getStoredUser()!.id)
            : undefined,
          items: selectedItemsData,
        },
      });

      // Navigate back to approval list on success
      navigate('/purchase-requisition/approve');
    } catch (error) {
      // Error handled by mutation
      console.error('Approval failed:', error);
    }
  };

  const handleBack = () => {
    navigate('/purchase-requisition/approve');
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error || !prDetails) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
          <span className='text-2xl'>⚠️</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Error Loading PR Details
        </h3>
        <p className='text-gray-500 mb-4'>
          Failed to load purchase request details. Please try again.
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={handleBack}
            className='text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='h-6 w-6' />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-800'>PR Approval</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Request Number: {prDetails.requestNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='space-y-6'>
        {/* PR Header Information */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Request Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div>
              <label className='text-xs text-gray-500 font-medium'>
                Request Date
              </label>
              <p className='text-sm text-gray-900'>
                {new Date(prDetails.requestDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className='text-xs text-gray-500 font-medium'>
                Requested By
              </label>
              <p className='text-sm text-gray-900'>{prDetails.requestedBy}</p>
            </div>
            <div>
              <label className='text-xs text-gray-500 font-medium'>
                Employee Code
              </label>
              <p className='text-sm text-gray-900'>{prDetails.employeeCode}</p>
            </div>
            <div>
              <label className='text-xs text-gray-500 font-medium'>
                Designation
              </label>
              <p className='text-sm text-gray-900'>{prDetails.designation}</p>
            </div>
            <div>
              <label className='text-xs text-gray-500 font-medium'>
                Department
              </label>
              <p className='text-sm text-gray-900'>{prDetails.department}</p>
            </div>
            <div>
              <label className='text-xs text-gray-500 font-medium'>
                Purchase Type
              </label>
              <p className='text-sm text-gray-900'>{prDetails.purchaseType}</p>
            </div>
            {prDetails.projectCode && (
              <>
                <div>
                  <label className='text-xs text-gray-500 font-medium'>
                    Project Code
                  </label>
                  <p className='text-sm text-gray-900'>
                    {prDetails.projectCode}
                  </p>
                </div>
                <div>
                  <label className='text-xs text-gray-500 font-medium'>
                    Project Name
                  </label>
                  <p className='text-sm text-gray-900'>
                    {prDetails.projectName}
                  </p>
                </div>
              </>
            )}
            {prDetails.remarks && (
              <div className='md:col-span-2 lg:col-span-3'>
                <label className='text-xs text-gray-500 font-medium'>
                  Remarks
                </label>
                <p className='text-sm text-gray-900'>{prDetails.remarks}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Items for Approval
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-[#F7F8FA]'>
                <tr>
                  <th className='px-4 py-3 text-center'>
                    <input
                      type='checkbox'
                      checked={selectedItems.size === editableItems.length}
                      onChange={handleSelectAll}
                      className='rounded border-gray-300 text-violet-600 focus:ring-violet-500'
                    />
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    S.No
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Category
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Model
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Make
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Description
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    UOM
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Quantity
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Total Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {editableItems.map((item, index) => (
                  <tr
                    key={item.itemId}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedItems.has(item.itemId) ? 'bg-violet-50' : ''
                    }`}
                  >
                    <td className='px-4 py-3 text-center'>
                      <input
                        type='checkbox'
                        checked={selectedItems.has(item.itemId)}
                        onChange={() => handleToggleItem(item.itemId)}
                        className='rounded border-gray-300 text-violet-600 focus:ring-violet-500'
                      />
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {item.categoryName}
                      {item.subCategoryName && ` / ${item.subCategoryName}`}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {item.modelName}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {item.make}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {item.description}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {item.uomName}
                    </td>
                    <td className='px-4 py-3'>
                      <Input
                        type='number'
                        value={item.quantity}
                        onChange={e =>
                          updateItemField(
                            item.itemId,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        className='w-20'
                        min='1'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <Input
                        type='number'
                        value={item.unitPrice}
                        onChange={e =>
                          updateItemField(
                            item.itemId,
                            'unitPrice',
                            Number(e.target.value)
                          )
                        }
                        className='w-24'
                        min='0'
                        step='0.01'
                      />
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                      {item.totalPrice.toFixed(2)}
                    </td>
                    <td className='px-4 py-3'>
                      <Input
                        type='text'
                        value={item.remarks}
                        onChange={e =>
                          updateItemField(
                            item.itemId,
                            'remarks',
                            e.target.value
                          )
                        }
                        className='w-40'
                        placeholder='Item remarks'
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Remarks */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            General Remarks (Optional)
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            placeholder='Enter general remarks for this approval...'
          />
        </div>

        {/* Footer Actions */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              {selectedItems.size} of {editableItems.length} item(s) selected
            </div>
            <div className='flex space-x-3'>
              <Button
                variant='outline'
                onClick={handleBack}
                disabled={approveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit('Rejected')}
                disabled={approveMutation.isPending || selectedItems.size === 0}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                <XCircle className='h-4 w-4 mr-2' />
                Reject Selected
              </Button>
              <Button
                onClick={() => handleSubmit('Accepted')}
                disabled={approveMutation.isPending || selectedItems.size === 0}
                className='bg-green-600 hover:bg-green-700 text-white'
              >
                <Check className='h-4 w-4 mr-2' />
                Approve Selected
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
