import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, ChevronDown } from 'lucide-react';
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
    }
  };

  const totals = calculateTotals();

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/invoice/list')}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Invoice Entry
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Create invoice from approved Purchase Order
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate('/invoice/list')}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Save size={15} />
            Save as Draft
          </button>
          <button
            type='button'
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FileText size={15} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Select PO Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
        <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
          <h2 className='text-base font-semibold text-gray-900'>
            Select Purchase Order
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Purchase Order
              </label>
              <div className='relative'>
                <select
                  value={selectedPoId || ''}
                  onChange={e => setSelectedPoId(Number(e.target.value))}
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  required
                >
                  <option value=''>Select PO</option>
                  {availablePOs?.map(po => (
                    <option key={po.poId} value={po.poId}>
                      {po.poNumber} - {po.supplierName} ({po.poDate})
                    </option>
                  ))}
                </select>
                <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>

            {poDetails && (
              <>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Supplier
                  </label>
                  <p className='text-sm text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                    {poDetails.supplierName}
                    {poDetails.supplierCode && ` (${poDetails.supplierCode})`}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    PO Date
                  </label>
                  <p className='text-sm text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                    {poDetails.poDate}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    PO Amount
                  </label>
                  <p className='text-sm font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                    ₹
                    {poDetails.grandTotal?.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Information Card */}
      {selectedPoId && (
        <>
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
              <h2 className='text-base font-semibold text-gray-900'>
                Invoice Information
              </h2>
            </div>
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Invoice Number
                  </label>
                  <input
                    type='text'
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Invoice Date
                  </label>
                  <input
                    type='date'
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                    min='0'
                    step='0.01'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Card */}
          {items.length > 0 && (
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
              <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
                <h2 className='text-base font-semibold text-gray-900'>
                  Invoice Items
                </h2>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Item
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        PO Qty
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Remaining
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Invoice Qty
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Rate
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        CGST %
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        SGST %
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-4 py-3.5'>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>
                              {item.itemName}
                            </p>
                            {item.itemCode && (
                              <p className='text-xs text-gray-500 mt-0.5'>
                                {item.itemCode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                          {item.poQuantity}
                        </td>
                        <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                          {item.remainingQuantity}
                        </td>
                        <td className='px-4 py-3.5'>
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
                            className='w-24 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                            min='0'
                            max={item.remainingQuantity}
                            step='0.01'
                            required
                          />
                        </td>
                        <td className='px-4 py-3.5 text-right text-sm text-gray-700'>
                          ₹
                          {item.unitPrice.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                          {item.cgstRate}%
                        </td>
                        <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                          {item.sgstRate}%
                        </td>
                        <td className='px-4 py-3.5 text-right text-sm font-semibold text-gray-900'>
                          ₹
                          {item.totalAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className='px-6 py-4 border-t border-gray-200 bg-white'>
                <div className='flex justify-end'>
                  <div className='w-80 bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <div className='space-y-3'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Subtotal</span>
                        <span className='font-medium text-gray-900'>
                          ₹
                          {totals.subTotal.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Tax Amount</span>
                        <span className='font-medium text-gray-900'>
                          ₹
                          {totals.taxAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {freightCharges > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Freight Charges</span>
                          <span className='font-medium text-gray-900'>
                            ₹
                            {freightCharges.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Discount</span>
                          <span className='font-medium text-red-600'>
                            -₹
                            {discountAmount.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                      <div className='border-t-2 border-violet-600 pt-3 mt-3'>
                        <div className='flex justify-between'>
                          <span className='text-base font-bold text-gray-900'>
                            Grand Total
                          </span>
                          <span className='text-lg font-bold text-violet-600'>
                            ₹
                            {totals.grandTotal.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remarks Card */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
              <h2 className='text-base font-semibold text-gray-900'>Remarks</h2>
            </div>
            <div className='p-6'>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                rows={3}
                className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
