/**
 * Edit PO Page
 * Allows editing existing Purchase Orders in DRAFT status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  usePurchaseOrder,
  useUpdatePurchaseOrder,
  useSubmitPOForApproval,
} from '../hooks/usePurchaseOrders';

export const EditPOPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const poId = id ? parseInt(id, 10) : 0;

  const [activeTab, setActiveTab] = useState('itemDetails');
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    poNumber: '',
    poType: POType.INDIRECT,
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
  const { data: existingPO, isLoading: isLoadingPO } = usePurchaseOrder(poId);
  const updatePO = useUpdatePurchaseOrder();
  const submitForApproval = useSubmitPOForApproval();

  // Load existing PO data when available
  useEffect(() => {
    if (existingPO) {
      setFormData({
        ...existingPO,
        items: existingPO.items || [],
      });
    }
  }, [existingPO]);

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
      const updated = { ...prev, [name]: value };

      // Auto-calculate when quantity or unit price changes
      if (name === 'quantity' || name === 'unitPrice') {
        const qty = parseFloat(
          name === 'quantity' ? value : updated.quantity?.toString() || '0'
        );
        const price = parseFloat(
          name === 'unitPrice' ? value : updated.unitPrice?.toString() || '0'
        );
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

  const updateExistingItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedItems = [...(prev.items || [])];
      const item = { ...updatedItems[index], [field]: value };

      // Recalculate if quantity or price changed
      if (field === 'quantity' || field === 'unitPrice') {
        item.totalAmount = (item.quantity || 0) * (item.unitPrice || 0);
        const tax1 = (item.totalAmount * (item.tax1Rate || 0)) / 100;
        const tax2 = (item.totalAmount * (item.tax2Rate || 0)) / 100;
        item.tax1Value = tax1;
        item.tax2Value = tax2;
        item.grandTotal = item.totalAmount + tax1 + tax2;
      }

      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
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
        status: shouldSubmitForApproval ? POStatus.SUBMITTED : POStatus.DRAFT,
      };

      await updatePO.mutateAsync({ id: poId, data: poData });

      // If user clicked "Submit PO", also submit for approval
      if (shouldSubmitForApproval) {
        await submitForApproval.mutateAsync(poId);
      }

      navigate('/purchase-orders/modify');
    } catch (error: any) {
      console.error('Error updating PO:', error);
      // Error toast already handled by the hooks
    }
  };

  if (isLoadingPO) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600 text-lg'>Loading PO data...</p>
        </div>
      </div>
    );
  }

  if (!existingPO) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-600 mx-auto mb-4' />
          <p className='text-gray-900 text-lg font-medium'>
            Purchase Order not found
          </p>
          <button
            onClick={() => navigate('/purchase-orders/modify')}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Back to List
          </button>
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
            onClick={() => navigate('/purchase-orders/modify')}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            disabled={updatePO.isPending}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Edit Purchase Order
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              PO #{formData.poNumber} - {formData.poType}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => handleSubmit(false)}
            disabled={updatePO.isPending || !formData.items?.length}
            className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Update as Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={updatePO.isPending || !formData.items?.length}
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
                Editing Draft Purchase Order
              </h4>
              <p className='text-sm text-blue-700 mt-1'>
                Make changes to the PO details and items. You can save as draft
                to continue later or submit for approval when ready.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5'>
              {/* PO Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> PO Number
                </label>
                <input
                  type='text'
                  name='poNumber'
                  value={formData.poNumber}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  readOnly
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
                  value={formData.poDate}
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
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
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
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Enter supplier name'
                />
              </div>

              {/* Raised By */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Raised By
                </label>
                <input
                  type='text'
                  name='raisedBy'
                  value={formData.raisedBy}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Enter name'
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
                  value={formData.department}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Enter department'
                />
              </div>

              {/* Currency */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Currency
                </label>
                <select
                  name='currency'
                  value={formData.currency}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                >
                  <option value='INR'>INR - Indian Rupee</option>
                  <option value='USD'>USD - US Dollar</option>
                  <option value='EUR'>EUR - Euro</option>
                </select>
              </div>

              {/* Payment Terms */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Payment Terms
                </label>
                <input
                  type='text'
                  name='paymentTerms'
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='e.g., Net 30 days'
                />
              </div>

              {/* Approval Group */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Approval Group
                </label>
                <input
                  type='text'
                  name='approvalGroup'
                  value={formData.approvalGroup}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Enter approval group'
                />
              </div>

              {/* Ship To Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Ship To Address
                </label>
                <textarea
                  name='shipToAddress'
                  value={formData.shipToAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                  placeholder='Enter shipping address'
                />
              </div>

              {/* Bill To Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bill To Address
                </label>
                <textarea
                  name='billToAddress'
                  value={formData.billToAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                  placeholder='Enter billing address'
                />
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Terms & Conditions
                </label>
                <textarea
                  name='termsConditions'
                  value={formData.termsConditions}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                  placeholder='Enter terms and conditions'
                />
              </div>

              {/* Remarks */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks
                </label>
                <textarea
                  name='remarks'
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 text-sm border rounded-lg bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none'
                  placeholder='Enter any remarks'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              PO Items
            </h2>

            {/* Existing Items Table */}
            {formData.items && formData.items.length > 0 && (
              <div className='mb-6 overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Name
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Code
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
                        Total
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Tax
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Grand Total
                      </th>
                      <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={item.itemName}
                            onChange={e =>
                              updateExistingItem(
                                index,
                                'itemName',
                                e.target.value
                              )
                            }
                            className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='text'
                            value={item.itemCode || ''}
                            onChange={e =>
                              updateExistingItem(
                                index,
                                'itemCode',
                                e.target.value
                              )
                            }
                            className='w-24 px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='number'
                            value={item.quantity}
                            onChange={e =>
                              updateExistingItem(
                                index,
                                'quantity',
                                parseFloat(e.target.value)
                              )
                            }
                            className='w-20 px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </td>
                        <td className='px-4 py-3'>
                          <select
                            value={item.unitOfMeasurement}
                            onChange={e =>
                              updateExistingItem(
                                index,
                                'unitOfMeasurement',
                                e.target.value
                              )
                            }
                            className='w-20 px-2 py-1 border border-gray-300 rounded text-sm'
                          >
                            <option value='PCS'>PCS</option>
                            <option value='KG'>KG</option>
                            <option value='LTR'>LTR</option>
                            <option value='MTR'>MTR</option>
                          </select>
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='number'
                            value={item.unitPrice}
                            onChange={e =>
                              updateExistingItem(
                                index,
                                'unitPrice',
                                parseFloat(e.target.value)
                              )
                            }
                            className='w-24 px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-700'>
                          ₹{item.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-700'>
                          ₹
                          {(
                            (item.tax1Value || 0) + (item.tax2Value || 0)
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                          ₹{item.grandTotal?.toFixed(2) || '0.00'}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          <button
                            onClick={() => removeItem(index)}
                            className='text-red-600 hover:text-red-800'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add New Item Form */}
            <div className='border-t border-gray-200 pt-6'>
              <h3 className='text-md font-medium text-gray-900 mb-4'>
                Add New Item
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Item Name *
                  </label>
                  <input
                    type='text'
                    name='itemName'
                    value={newItem.itemName}
                    onChange={handleItemChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter item name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Item Code
                  </label>
                  <input
                    type='text'
                    name='itemCode'
                    value={newItem.itemCode}
                    onChange={handleItemChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    placeholder='Code'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Quantity *
                  </label>
                  <input
                    type='number'
                    name='quantity'
                    value={newItem.quantity}
                    onChange={handleItemChange}
                    min='1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    UOM
                  </label>
                  <select
                    name='unitOfMeasurement'
                    value={newItem.unitOfMeasurement}
                    onChange={handleItemChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='PCS'>PCS</option>
                    <option value='KG'>KG</option>
                    <option value='LTR'>LTR</option>
                    <option value='MTR'>MTR</option>
                    <option value='BOX'>BOX</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Unit Price *
                  </label>
                  <input
                    type='number'
                    name='unitPrice'
                    value={newItem.unitPrice}
                    onChange={handleItemChange}
                    min='0'
                    step='0.01'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              {/* Item Calculations Display */}
              {newItem.totalAmount && newItem.totalAmount > 0 && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <div className='grid grid-cols-4 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-600'>Total Amount:</span>
                      <span className='ml-2 font-medium text-gray-900'>
                        ₹{newItem.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>CGST (9%):</span>
                      <span className='ml-2 font-medium text-gray-900'>
                        ₹{newItem.tax1Value?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>SGST (9%):</span>
                      <span className='ml-2 font-medium text-gray-900'>
                        ₹{newItem.tax2Value?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Grand Total:</span>
                      <span className='ml-2 font-medium text-green-600'>
                        ₹{newItem.grandTotal?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={addItem}
                className='mt-4 inline-flex items-center px-4 py-3 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
              >
                <Plus className='w-4 h-4 mr-2' />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* PO Summary */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-4'>
              PO Summary
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Sub Total:</span>
                <span className='font-medium text-gray-900'>
                  ₹{formData.subTotal?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Tax Amount:</span>
                <span className='font-medium text-gray-900'>
                  ₹{formData.taxAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                <span className='text-gray-600'>Discount:</span>
                <div className='flex items-center space-x-2'>
                  <input
                    type='number'
                    name='discountAmount'
                    value={formData.discountAmount}
                    onChange={e => {
                      handleInputChange(e);
                      setTimeout(() => calculateTotals(), 100);
                    }}
                    min='0'
                    step='0.01'
                    className='w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right'
                  />
                </div>
              </div>
              <div className='flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4'>
                <span className='text-lg font-semibold text-gray-900'>
                  Grand Total:
                </span>
                <span className='text-xl font-bold text-blue-600'>
                  ₹
                  {formData.grandTotal?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditPOPage;
