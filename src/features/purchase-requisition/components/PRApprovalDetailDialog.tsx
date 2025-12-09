/**
 * Dialog component for approving/rejecting PR items
 */

import React, { useState, useEffect } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  usePRDetailsForApproval,
  useApprovePRItems,
} from '../hooks/useApproval';
import type { ApprovalItemRequest } from '../types/approval.types';
import { AuthService } from '@/services/auth';

interface PRApprovalDetailDialogProps {
  prId: number;
  onClose: () => void;
}

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

export const PRApprovalDetailDialog: React.FC<PRApprovalDetailDialogProps> = ({
  prId,
  onClose,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [remarks, setRemarks] = useState('');

  // Fetch PR details
  const { data: prDetails, isLoading, error } = usePRDetailsForApproval(prId);

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
        prId,
        approvalRequest: {
          prId,
          approvalStatus,
          remarks: remarks || undefined,
          approvedBy: AuthService.getStoredUser()?.id ? String(AuthService.getStoredUser()!.id) : undefined,
          items: selectedItemsData,
        },
      });

      // Close dialog on success
      onClose();
    } catch (error) {
      // Error handled by mutation
      console.error('Approval failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-8'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !prDetails) {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-8 max-w-md'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
              <span className='text-2xl'>⚠️</span>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Error Loading PR Details
            </h3>
            <p className='text-gray-500 mb-4'>
              Failed to load purchase request details. Please try again.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>PR Approval</h2>
            <p className='text-sm text-gray-500 mt-1'>
              Request Number: {prDetails.requestNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {/* PR Header Information */}
          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
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
                <p className='text-sm text-gray-900'>
                  {prDetails.employeeCode}
                </p>
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
                <p className='text-sm text-gray-900'>
                  {prDetails.purchaseType}
                </p>
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
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Items for Approval
            </h3>
            <div className='border border-gray-200 rounded-lg overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-center'>
                        <input
                          type='checkbox'
                          checked={selectedItems.size === editableItems.length}
                          onChange={handleSelectAll}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        S.No
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Category
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Model
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Make
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Description
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        UOM
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Quantity
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Total Price
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {editableItems.map((item, index) => (
                      <tr
                        key={item.itemId}
                        className={
                          selectedItems.has(item.itemId) ? 'bg-blue-50' : ''
                        }
                      >
                        <td className='px-4 py-3 text-center'>
                          <input
                            type='checkbox'
                            checked={selectedItems.has(item.itemId)}
                            onChange={() => handleToggleItem(item.itemId)}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {index + 1}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.categoryName}
                          {item.subCategoryName && ` / ${item.subCategoryName}`}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.modelName}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.make}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.description}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
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
                        <td className='px-4 py-3 text-sm text-gray-900 font-medium'>
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
          </div>

          {/* General Remarks */}
          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              General Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter general remarks for this approval...'
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <div className='text-sm text-gray-600'>
            {selectedItems.size} of {editableItems.length} item(s) selected
          </div>
          <div className='flex space-x-3'>
            <Button
              variant='outline'
              onClick={onClose}
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
  );
};
