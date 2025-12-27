/**
 * Create Direct PO Page
 * Allows creating Purchase Orders directly without PR/RFP workflow
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calendar,
  Loader2,
  Building,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { PurchaseOrder, PurchaseOrderItem } from '../types';
import { POType, POStatus } from '../types';
import {
  useGeneratePONumber,
  useCreatePurchaseOrder,
  useSubmitPOForApproval,
} from '../hooks/usePurchaseOrders';

export const CreateDirectPOPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itemDetails');
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    poNumber: '',
    poType: POType.DIRECT, // Key difference - Direct PO type
    poDate: format(new Date(), 'yyyy-MM-dd'),
    deliveryDate: '',
    supplierName: '',
    supplierId: 0,
    raisedBy: '',
    department: '',
    approvalGroup: '',
    paymentTerms: '',
    termsConditions: 'DELIVERY AS PER SCHEDULE',
    shipToAddress: '',
    billToAddress: '',
    remarks: '',
    items: [],
    currency: 'INR',
    subTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
  });

  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    itemName: '',
    itemCode: '',
    quantity: 1,
    unitOfMeasurement: 'PCS',
    unitPrice: 0,
    deliveryDate: '',
    tax1Type: 'CGST',
    tax1Rate: 9,
    tax2Type: 'SGST',
    tax2Rate: 9,
    totalAmount: 0,
    grandTotal: 0,
  });

  // React Query hooks
  const { data: generatedPONumber, isLoading: isGeneratingPO } =
    useGeneratePONumber();
  const createPO = useCreatePurchaseOrder();
  const submitForApproval = useSubmitPOForApproval();

  // Set generated PO number when available
  useEffect(() => {
    if (generatedPONumber && !formData.poNumber) {
      setFormData(prev => ({ ...prev, poNumber: generatedPONumber }));
    }
  }, [generatedPONumber]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewItem(prev => {
      // Convert numeric fields to numbers
      const numericFields = ['quantity', 'unitPrice', 'tax1Rate', 'tax2Rate'];
      const parsedValue = numericFields.includes(name)
        ? parseFloat(value) || 0
        : value;

      const updated = { ...prev, [name]: parsedValue };

      // Auto-calculate when quantity or unit price changes
      if (name === 'quantity' || name === 'unitPrice') {
        const qty =
          typeof updated.quantity === 'number'
            ? updated.quantity
            : parseFloat(String(updated.quantity || 0));
        const price =
          typeof updated.unitPrice === 'number'
            ? updated.unitPrice
            : parseFloat(String(updated.unitPrice || 0));
        updated.totalAmount = qty * price;

        // Calculate tax
        const tax1 = (updated.totalAmount * (updated.tax1Rate || 0)) / 100;
        const tax2 = (updated.totalAmount * (updated.tax2Rate || 0)) / 100;
        updated.tax1Value = tax1;
        updated.tax2Value = tax2;
        updated.grandTotal = updated.totalAmount + tax1 + tax2;
      }

      return updated;
    });
  };

  const addItem = () => {
    if (!newItem.itemName || !newItem.quantity || !newItem.unitPrice) {
      toast.error('Please fill in item name, quantity, and unit price');
      return;
    }

    const item: PurchaseOrderItem = {
      itemName: newItem.itemName || '',
      itemCode: newItem.itemCode || '',
      itemDescription: newItem.itemDescription || '',
      quantity: newItem.quantity || 0,
      unitOfMeasurement: newItem.unitOfMeasurement || 'PCS',
      unitPrice: newItem.unitPrice || 0,
      deliveryDate: newItem.deliveryDate || formData.deliveryDate || '',
      tax1Type: newItem.tax1Type || 'CGST',
      tax1Rate: newItem.tax1Rate || 9,
      tax2Type: newItem.tax2Type || 'SGST',
      tax2Rate: newItem.tax2Rate || 9,
      tax1Value: newItem.tax1Value || 0,
      tax2Value: newItem.tax2Value || 0,
      totalAmount: newItem.totalAmount || 0,
      grandTotal: newItem.grandTotal || 0,
      remarks: newItem.remarks || '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), item],
    }));

    // Reset new item form
    setNewItem({
      itemName: '',
      itemCode: '',
      quantity: 1,
      unitOfMeasurement: 'PCS',
      unitPrice: 0,
      deliveryDate: '',
      tax1Type: 'CGST',
      tax1Rate: 9,
      tax2Type: 'SGST',
      tax2Rate: 9,
      totalAmount: 0,
      grandTotal: 0,
    });

    // Recalculate totals
    setTimeout(() => calculateTotals(), 100);
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index),
    }));
    setTimeout(() => calculateTotals(), 100);
  };

  const calculateTotals = () => {
    const items = formData.items || [];
    const subTotal = items.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );
    const taxAmount = items.reduce(
      (sum, item) => sum + (item.tax1Value || 0) + (item.tax2Value || 0),
      0
    );
    const grandTotal = subTotal + taxAmount - (formData.discountAmount || 0);

    setFormData(prev => ({
      ...prev,
      subTotal,
      taxAmount,
      grandTotal,
    }));
  };

  const handleSubmit = async (shouldSubmitForApproval: boolean = false) => {
    try {
      // Validate required fields
      if (!formData.poNumber) {
        toast.error('PO Number is required');
        return;
      }
      if (!formData.supplierName) {
        toast.error('Supplier is required');
        return;
      }
      if (!formData.items || formData.items.length === 0) {
        toast.error('At least one item is required');
        return;
      }

      // Prepare PO data
      const poData = {
        ...formData,
        poType: POType.DIRECT, // Ensure Direct PO type
        status: shouldSubmitForApproval ? POStatus.SUBMITTED : POStatus.DRAFT,
      };

      const createdPO = await createPO.mutateAsync(poData);

      // If user clicked "Submit PO", also submit for approval
      if (shouldSubmitForApproval && createdPO?.id) {
        await submitForApproval.mutateAsync(createdPO.id);
      }

      navigate('/purchase-orders/direct');
    } catch (error: any) {
      console.error('Error saving Direct PO:', error);
      // Error toast already handled by the hooks
    }
  };

  if (isGeneratingPO && !formData.poNumber) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600 text-lg'>Generating PO number...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/purchase-orders/direct')}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            disabled={createPO.isPending}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className='text-xl font-semibold text-gray-900'>
            Create Direct Purchase Order
          </h1>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => handleSubmit(false)}
            disabled={createPO.isPending || !formData.items?.length}
            className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={createPO.isPending || !formData.items?.length}
            className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Submit
          </button>
        </div>
      </div>

      <form className='space-y-6'>
        {/* Info Banner */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 mr-3' />
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-blue-900'>
                Direct Purchase Order
              </h4>
              <p className='text-sm text-blue-700 mt-1'>
                This allows you to create a purchase order directly without
                going through the PR/RFP workflow. Use this for urgent or small
                value purchases that don't require formal quotation processes.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
              {/* PO Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> PO Number
                </label>
                <input
                  type='text'
                  name='poNumber'
                  value={formData.poNumber || ''}
                  readOnly
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* Raised By */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Raised By
                </label>
                <input
                  type='text'
                  name='raisedBy'
                  value={formData.raisedBy || ''}
                  onChange={handleInputChange}
                  placeholder='Enter your name'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* PO Date */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> PO Date
                </label>
                <input
                  type='date'
                  name='poDate'
                  value={formData.poDate || ''}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Delivery Date
                </label>
                <input
                  type='date'
                  name='deliveryDate'
                  value={formData.deliveryDate || ''}
                  onChange={handleInputChange}
                  min={formData.poDate}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* Supplier Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Supplier Name
                </label>
                <input
                  type='text'
                  name='supplierName'
                  value={formData.supplierName || ''}
                  onChange={handleInputChange}
                  placeholder='Enter supplier name'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* Department */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Department
                </label>
                <input
                  type='text'
                  name='department'
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  placeholder='Enter department'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Payment Terms
                </label>
                <select
                  name='paymentTerms'
                  value={formData.paymentTerms || ''}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                >
                  <option value=''>Select Payment Terms</option>
                  <option value='NET 30'>Net 30 Days</option>
                  <option value='NET 60'>Net 60 Days</option>
                  <option value='NET 90'>Net 90 Days</option>
                  <option value='ADVANCE'>Advance Payment</option>
                  <option value='COD'>Cash on Delivery</option>
                </select>
              </div>

              {/* Approval Group */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Approval Group
                </label>
                <input
                  type='text'
                  name='approvalGroup'
                  value={formData.approvalGroup || ''}
                  onChange={handleInputChange}
                  placeholder='Enter approval group'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              {/* Ship To Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ship To Address
                </label>
                <textarea
                  name='shipToAddress'
                  value={formData.shipToAddress || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder='Enter shipping address'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                />
              </div>

              {/* Bill To Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bill To Address
                </label>
                <textarea
                  name='billToAddress'
                  value={formData.billToAddress || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder='Enter billing address'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                />
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Terms & Conditions
                </label>
                <textarea
                  name='termsConditions'
                  value={formData.termsConditions || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder='Enter terms and conditions'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                />
              </div>

              {/* Remarks */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks
                </label>
                <textarea
                  name='remarks'
                  value={formData.remarks || ''}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={2000}
                  placeholder='Enter any remarks (2000 characters max)'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                />
                <div className='text-xs text-gray-500 mt-1'>
                  {(formData.remarks || '').length} / 2000 characters
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Item */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              Add Item
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Item Name
                </label>
                <input
                  type='text'
                  name='itemName'
                  value={newItem.itemName || ''}
                  onChange={handleItemChange}
                  placeholder='Enter item name'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Item Code
                </label>
                <input
                  type='text'
                  name='itemCode'
                  value={newItem.itemCode || ''}
                  onChange={handleItemChange}
                  placeholder='Enter item code'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Quantity
                </label>
                <input
                  type='number'
                  name='quantity'
                  value={newItem.quantity || ''}
                  onChange={handleItemChange}
                  min='1'
                  step='1'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  UOM
                </label>
                <select
                  name='unitOfMeasurement'
                  value={newItem.unitOfMeasurement || 'PCS'}
                  onChange={handleItemChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                >
                  <option value='PCS'>Pieces</option>
                  <option value='KG'>Kilograms</option>
                  <option value='L'>Liters</option>
                  <option value='M'>Meters</option>
                  <option value='BOX'>Box</option>
                  <option value='SET'>Set</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Unit Price (₹)
                </label>
                <input
                  type='number'
                  name='unitPrice'
                  value={newItem.unitPrice || ''}
                  onChange={handleItemChange}
                  min='0'
                  step='0.01'
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Delivery Date
                </label>
                <input
                  type='date'
                  name='deliveryDate'
                  value={newItem.deliveryDate || ''}
                  onChange={handleItemChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                />
              </div>

              <div className='md:col-span-2 flex items-end'>
                <button
                  onClick={addItem}
                  className='w-full px-4 py-3 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors flex items-center justify-center'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Item
                </button>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div className='bg-gray-50 p-3 rounded-lg'>
                <div className='text-gray-600 mb-1'>Total Amount</div>
                <div className='font-medium text-gray-900'>
                  ₹ {newItem.totalAmount?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className='bg-gray-50 p-3 rounded-lg'>
                <div className='text-gray-600 mb-1'>Tax (18%)</div>
                <div className='font-medium text-gray-900'>
                  ₹{' '}
                  {(
                    (newItem.tax1Value || 0) + (newItem.tax2Value || 0)
                  ).toFixed(2)}
                </div>
              </div>
              <div className='bg-gray-50 p-3 rounded-lg'>
                <div className='text-gray-600 mb-1'>Item Total</div>
                <div className='font-medium text-violet-600'>
                  ₹ {newItem.grandTotal?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              Items ({formData.items?.length || 0})
            </h2>
            {!formData.items || formData.items.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-2'>No items added yet</div>
                <div className='text-sm text-gray-500'>
                  Add items using the form above
                </div>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-y border-gray-200'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Name
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Code
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Qty
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        UOM
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Tax
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Total
                      </th>
                      <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {formData.items.map((item, index) => (
                      <tr key={index} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.itemName}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {item.itemCode || '-'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.quantity}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {item.unitOfMeasurement}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          ₹
                          {(typeof item.unitPrice === 'number'
                            ? item.unitPrice
                            : parseFloat(String(item.unitPrice || 0))
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          ₹
                          {(
                            (item.tax1Value || 0) + (item.tax2Value || 0)
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                          ₹
                          {(typeof item.grandTotal === 'number'
                            ? item.grandTotal
                            : parseFloat(String(item.grandTotal || 0))
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            onClick={() => removeItem(index)}
                            className='p-1 text-red-600 hover:bg-red-50 rounded transition-colors'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='bg-gray-50 border-t border-gray-200'>
                    <tr>
                      <td
                        colSpan={6}
                        className='px-4 py-3 text-right text-sm font-medium text-gray-900'
                      >
                        Subtotal:
                      </td>
                      <td className='px-4 py-3 text-sm font-bold text-gray-900'>
                        ₹{formData.subTotal?.toFixed(2) || '0.00'}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={6}
                        className='px-4 py-3 text-right text-sm font-medium text-gray-900'
                      >
                        Total Tax:
                      </td>
                      <td className='px-4 py-3 text-sm font-bold text-gray-900'>
                        ₹{formData.taxAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td
                        colSpan={6}
                        className='px-4 py-3 text-right text-sm font-medium text-gray-900'
                      >
                        Grand Total:
                      </td>
                      <td className='px-4 py-3 text-sm font-bold text-green-600'>
                        ₹{formData.grandTotal?.toFixed(2) || '0.00'}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateDirectPOPage;
