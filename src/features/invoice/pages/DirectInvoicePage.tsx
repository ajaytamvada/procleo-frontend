import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateDirectInvoice,
  useGenerateInvoiceNumber,
} from '../hooks/useInvoice';
import type {
  CreateDirectInvoiceRequest,
  DirectInvoiceItemRequest,
} from '../types';

interface DirectInvoiceItemForm extends DirectInvoiceItemRequest {
  baseAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
}

const DirectInvoicePage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [supplierId, setSupplierId] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [locationId, setLocationId] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<DirectInvoiceItemForm[]>([]);

  // Queries
  const { data: generatedNumber } = useGenerateInvoiceNumber();

  // Mutations
  const createMutation = useCreateDirectInvoice();

  // Set generated invoice number
  useEffect(() => {
    if (generatedNumber) {
      setInvoiceNumber(generatedNumber);
    }
  }, [generatedNumber]);

  const calculateItemAmounts = (item: DirectInvoiceItemForm) => {
    const baseAmount = item.quantity * item.unitPrice;
    const taxableAmount = baseAmount - (item.otherCharges || 0);

    const cgstAmount = (taxableAmount * (item.cgstRate || 0)) / 100;
    const sgstAmount = (taxableAmount * (item.sgstRate || 0)) / 100;
    const igstAmount = (taxableAmount * (item.igstRate || 0)) / 100;
    const otherTaxAmount = (taxableAmount * (item.otherTaxRate || 0)) / 100;

    const totalTaxAmount =
      cgstAmount + sgstAmount + igstAmount + otherTaxAmount;
    const totalAmount = taxableAmount + totalTaxAmount;

    item.baseAmount = baseAmount;
    item.taxableAmount = taxableAmount;
    item.cgstAmount = cgstAmount;
    item.sgstAmount = sgstAmount;
    item.igstAmount = igstAmount;
    item.totalTaxAmount = totalTaxAmount;
    item.totalAmount = totalAmount;
  };

  const addItem = () => {
    const newItem: DirectInvoiceItemForm = {
      itemName: '',
      itemCode: '',
      manufacturer: '',
      categoryId: undefined,
      subCategoryId: undefined,
      assetType: '',
      uomId: undefined,
      quantity: 1,
      unitPrice: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      otherTaxRate: 0,
      otherCharges: 0,
      buyback: 0,
      remarks: '',
      baseAmount: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTaxAmount: 0,
      totalAmount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof DirectInvoiceItemForm,
    value: any
  ) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    (item as any)[field] = value;

    // Recalculate amounts if numeric field changed
    if (
      [
        'quantity',
        'unitPrice',
        'cgstRate',
        'sgstRate',
        'igstRate',
        'otherTaxRate',
        'otherCharges',
      ].includes(field)
    ) {
      calculateItemAmounts(item);
    }

    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.baseAmount, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.totalTaxAmount, 0);
    const grandTotal = subTotal + taxAmount;

    return { subTotal, taxAmount, grandTotal };
  };

  const handleSubmit = async (isDraft: boolean) => {
    // Validation
    if (!invoiceNumber) {
      toast.error('Invoice number is required');
      return;
    }

    if (!invoiceDate) {
      toast.error('Invoice date is required');
      return;
    }

    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (!locationId) {
      toast.error('Please select a location');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Validate all items have required fields
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName) {
        toast.error(`Item ${i + 1}: Item name is required`);
        return;
      }
      if (item.quantity <= 0) {
        toast.error(`Item ${i + 1}: Quantity must be greater than 0`);
        return;
      }
      if (item.unitPrice <= 0) {
        toast.error(`Item ${i + 1}: Unit price must be greater than 0`);
        return;
      }
    }

    // Prepare request
    const request: CreateDirectInvoiceRequest = {
      invoiceNumber,
      invoiceDate,
      poNumber: poNumber || undefined,
      poDate: poDate || undefined,
      supplierId,
      locationId,
      remarks: remarks || undefined,
      isDraft,
      items: items.map(item => ({
        itemName: item.itemName,
        itemCode: item.itemCode || undefined,
        manufacturer: item.manufacturer || undefined,
        categoryId: item.categoryId,
        subCategoryId: item.subCategoryId,
        assetType: item.assetType || undefined,
        uomId: item.uomId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        igstRate: item.igstRate,
        otherTaxRate: item.otherTaxRate,
        otherCharges: item.otherCharges,
        buyback: item.buyback,
        remarks: item.remarks || undefined,
      })),
    };

    try {
      await createMutation.mutateAsync(request);
      toast.success(
        isDraft
          ? 'Direct invoice saved as draft successfully'
          : 'Direct invoice created successfully'
      );
      navigate('/invoice/list');
    } catch (error: any) {
      console.error('Failed to create direct invoice:', error);
      // Error toast is already shown by the mutation hook
    }
  };

  const totals = calculateTotals();

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/invoice/list')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Direct Invoice</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Create invoice without Purchase Order reference
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            type='button'
            onClick={() => navigate('/invoice/list')}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending}
            className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-2' />
            Save as Draft
          </button>
          <button
            type='button'
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending}
            className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
          >
            <FileText className='w-4 h-4 mr-2' />
            Submit Invoice
          </button>
        </div>
      </div>

      {/* Invoice Information */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Invoice Information
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Invoice Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Invoice Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                PO Number (Manual)
              </label>
              <input
                type='text'
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Manual PO reference'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                PO Date (Manual)
              </label>
              <input
                type='date'
                value={poDate}
                onChange={e => setPoDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Supplier <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={supplierId || ''}
                onChange={e => setSupplierId(Number(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Supplier ID'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>
                Note: In production, this would be a searchable dropdown
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Location <span className='text-red-500'>*</span>
              </label>
              <input
                type='number'
                value={locationId || ''}
                onChange={e => setLocationId(Number(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                placeholder='Location ID'
                required
              />
              <p className='text-xs text-gray-500 mt-1'>
                Note: In production, this would be a dropdown
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
          <h2 className='text-lg font-semibold text-gray-900'>Invoice Items</h2>
          <button
            type='button'
            onClick={addItem}
            className='flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Plus className='w-4 h-4 mr-1' />
            Add Item
          </button>
        </div>
        <div className='overflow-x-auto'>
          {items.length > 0 ? (
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Item Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Code
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Manufacturer
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Qty
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Rate
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    CGST %
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    SGST %
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Total
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className='px-4 py-3'>
                      <input
                        type='text'
                        value={item.itemName}
                        onChange={e =>
                          handleItemChange(index, 'itemName', e.target.value)
                        }
                        className='w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500'
                        placeholder='Item name'
                        required
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='text'
                        value={item.itemCode || ''}
                        onChange={e =>
                          handleItemChange(index, 'itemCode', e.target.value)
                        }
                        className='w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500'
                        placeholder='Code'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='text'
                        value={item.manufacturer || ''}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'manufacturer',
                            e.target.value
                          )
                        }
                        className='w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500'
                        placeholder='Manufacturer'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        value={item.quantity}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-20 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-blue-500'
                        min='0'
                        step='0.01'
                        required
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        value={item.unitPrice}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-blue-500'
                        min='0'
                        step='0.01'
                        required
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        value={item.cgstRate || 0}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'cgstRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-16 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-blue-500'
                        min='0'
                        max='100'
                        step='0.5'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        value={item.sgstRate || 0}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'sgstRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-16 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-blue-500'
                        min='0'
                        max='100'
                        step='0.5'
                      />
                    </td>
                    <td className='px-4 py-3 text-right text-sm font-semibold text-gray-900'>
                      ₹{' '}
                      {item.totalAmount.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <button
                        type='button'
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
          ) : (
            <div className='p-8 text-center text-gray-500'>
              <p>No items added yet. Click "Add Item" to start.</p>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <div className='flex justify-end'>
              <div className='w-64 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Subtotal:</span>
                  <span className='text-sm font-medium text-gray-900'>
                    ₹{' '}
                    {totals.subTotal.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Tax Amount:</span>
                  <span className='text-sm font-medium text-gray-900'>
                    ₹{' '}
                    {totals.taxAmount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-t border-gray-300'>
                  <span className='text-base font-semibold text-gray-900'>
                    Grand Total:
                  </span>
                  <span className='text-lg font-bold text-blue-600'>
                    ₹{' '}
                    {totals.grandTotal.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remarks */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>Remarks</h2>
        </div>
        <div className='p-6'>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            placeholder='Enter any remarks or notes...'
          />
        </div>
      </div>
    </div>
  );
};

export default DirectInvoicePage;
