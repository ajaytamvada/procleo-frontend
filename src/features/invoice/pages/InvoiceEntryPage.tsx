import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePOsForInvoicing,
  usePODetails,
  usePOItemsForInvoicing,
  useCreateInvoice,
  useGenerateInvoiceNumber,
} from '../hooks/useInvoice';
import type { CreateInvoiceRequest, InvoiceItemRequest } from '../types';

interface InvoiceItemForm extends InvoiceItemRequest {
  itemName: string;
  itemCode?: string;
  unitOfMeasurement?: string;
  poQuantity: number;
  remainingQuantity: number;
  baseAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
}

const InvoiceEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState('');
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  // Queries
  const { data: availablePOs, isLoading: isLoadingPOs } = usePOsForInvoicing();
  const { data: poDetails } = usePODetails(selectedPoId);
  const { data: poItems } = usePOItemsForInvoicing(selectedPoId);
  const { data: generatedNumber } = useGenerateInvoiceNumber();

  // Mutations
  const createMutation = useCreateInvoice();

  // Set generated invoice number
  useEffect(() => {
    if (generatedNumber) {
      setInvoiceNumber(generatedNumber);
    }
  }, [generatedNumber]);

  // Load PO items when PO is selected
  useEffect(() => {
    if (poItems && poItems.length > 0) {
      const formItems: InvoiceItemForm[] = poItems.map(item => ({
        poItemId: item.poItemId,
        itemName: item.itemName,
        itemCode: item.itemCode,
        unitOfMeasurement: item.unitOfMeasurement,
        poQuantity: item.poQuantity,
        remainingQuantity: item.remainingQuantity,
        invoiceQuantity: item.remainingQuantity,
        unitPrice: item.unitPrice,
        cgstRate: item.cgstRate || 0,
        sgstRate: item.sgstRate || 0,
        igstRate: item.igstRate || 0,
        otherTaxRate: item.otherTaxRate || 0,
        otherCharges: 0,
        buyback: 0,
        remarks: '',
        // Calculated fields
        baseAmount: item.remainingQuantity * item.unitPrice,
        taxableAmount: item.remainingQuantity * item.unitPrice,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTaxAmount: 0,
        totalAmount: 0,
      }));

      // Calculate amounts for each item
      formItems.forEach(item => calculateItemAmounts(item));

      setItems(formItems);
    }
  }, [poItems]);

  const calculateItemAmounts = (item: InvoiceItemForm) => {
    const baseAmount = item.invoiceQuantity * item.unitPrice;
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

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemForm,
    value: any
  ) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    // Update the field
    (item as any)[field] = value;

    // Validate invoice quantity
    if (field === 'invoiceQuantity') {
      const qty = parseFloat(value) || 0;
      if (qty > item.remainingQuantity) {
        toast.error(
          `Invoice quantity cannot exceed remaining quantity (${item.remainingQuantity})`
        );
        item.invoiceQuantity = item.remainingQuantity;
      }
    }

    // Recalculate amounts
    calculateItemAmounts(item);

    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.baseAmount, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.totalTaxAmount, 0);
    const grandTotal = subTotal + taxAmount + freightCharges - discountAmount;

    return { subTotal, taxAmount, grandTotal };
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedPoId) {
      toast.error('Please select a Purchase Order');
      return;
    }

    if (!poDetails) {
      toast.error('PO details not loaded');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Validate invoice date is not before PO date
    const poDateObj = new Date(poDetails.poDate);
    const invDateObj = new Date(invoiceDate);
    if (invDateObj < poDateObj) {
      toast.error('Invoice date cannot be before PO date');
      return;
    }

    // Prepare request
    const request: CreateInvoiceRequest = {
      poId: selectedPoId,
      invoiceNumber,
      invoiceDate,
      supplierId: poDetails.supplierId,
      remarks: remarks || undefined,
      freightCharges: freightCharges || undefined,
      discountAmount: discountAmount || undefined,
      items: items.map(item => ({
        poItemId: item.poItemId,
        invoiceQuantity: item.invoiceQuantity,
        unitPrice: item.unitPrice,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        igstRate: item.igstRate,
        otherTaxRate: item.otherTaxRate,
        otherCharges: item.otherCharges,
        buyback: item.buyback,
        remarks: item.remarks,
      })),
    };

    try {
      await createMutation.mutateAsync(request);
      navigate('/invoice/list');
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
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
            <h1 className='text-2xl font-bold text-gray-900'>Invoice Entry</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Create invoice from approved Purchase Order
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
            Create Invoice
          </button>
        </div>
      </div>

      {/* Select PO */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Select Purchase Order
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Purchase Order <span className='text-red-500'>*</span>
              </label>
              <select
                value={selectedPoId || ''}
                onChange={e => setSelectedPoId(Number(e.target.value))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value=''>Select PO</option>
                {availablePOs?.map(po => (
                  <option key={po.poId} value={po.poId}>
                    {po.poNumber} - {po.supplierName} ({po.poDate})
                  </option>
                ))}
              </select>
            </div>

            {poDetails && (
              <>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Supplier
                  </label>
                  <p className='text-sm text-gray-900 py-2'>
                    {poDetails.supplierName}
                    {poDetails.supplierCode && ` (${poDetails.supplierCode})`}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    PO Date
                  </label>
                  <p className='text-sm text-gray-900 py-2'>
                    {poDetails.poDate}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    PO Amount
                  </label>
                  <p className='text-sm text-gray-900 py-2'>
                    ₹ {poDetails.grandTotal?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Information */}
      {selectedPoId && (
        <>
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
                    Freight Charges
                  </label>
                  <input
                    type='number'
                    value={freightCharges}
                    onChange={e =>
                      setFreightCharges(parseFloat(e.target.value) || 0)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    min='0'
                    step='0.01'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Discount Amount
                  </label>
                  <input
                    type='number'
                    value={discountAmount}
                    onChange={e =>
                      setDiscountAmount(parseFloat(e.target.value) || 0)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    min='0'
                    step='0.01'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {items.length > 0 && (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Invoice Items
                </h2>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        PO Qty
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Remaining
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Invoice Qty
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
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className='px-4 py-3'>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {item.itemName}
                            </p>
                            {item.itemCode && (
                              <p className='text-xs text-gray-500'>
                                {item.itemCode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className='px-4 py-3 text-right text-sm text-gray-900'>
                          {item.poQuantity}
                        </td>
                        <td className='px-4 py-3 text-right text-sm text-gray-900'>
                          {item.remainingQuantity}
                        </td>
                        <td className='px-4 py-3'>
                          <input
                            type='number'
                            value={item.invoiceQuantity}
                            onChange={e =>
                              handleItemChange(
                                index,
                                'invoiceQuantity',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-24 px-2 py-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-blue-500'
                            min='0'
                            max={item.remainingQuantity}
                            step='0.01'
                            required
                          />
                        </td>
                        <td className='px-4 py-3 text-right text-sm text-gray-900'>
                          ₹ {item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className='px-4 py-3 text-right text-sm text-gray-900'>
                          {item.cgstRate}%
                        </td>
                        <td className='px-4 py-3 text-right text-sm text-gray-900'>
                          {item.sgstRate}%
                        </td>
                        <td className='px-4 py-3 text-right text-sm font-semibold text-gray-900'>
                          ₹{' '}
                          {item.totalAmount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    {freightCharges > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>
                          Freight Charges:
                        </span>
                        <span className='text-sm font-medium text-gray-900'>
                          ₹{' '}
                          {freightCharges.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-600'>Discount:</span>
                        <span className='text-sm font-medium text-red-600'>
                          - ₹{' '}
                          {discountAmount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
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
            </div>
          )}

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
        </>
      )}
    </div>
  );
};

export default InvoiceEntryPage;
