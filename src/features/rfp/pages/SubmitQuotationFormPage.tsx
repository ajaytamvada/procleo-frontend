/**
 * Submit Quotation Form Page
 * Form for vendors to submit quotations for RFP items
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import {
  useRFPForQuotation,
  useSubmitQuotation,
} from '../hooks/useSubmitQuotation';
import { vendorApi } from '@/services/vendorApi';
import { QuotationStatus } from '../types';
import { useQuery } from '@tanstack/react-query';
import type { RFPQuotation, RFPQuotationItem } from '../types';

interface QuotationItemForm {
  rfpItemId: number;
  itemName: string;
  quantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  targetUnitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  remarks: string;
}

export const SubmitQuotationFormPage: React.FC = () => {
  const { rfpId, supplierId } = useParams<{
    rfpId: string;
    supplierId: string;
  }>();
  const navigate = useNavigate();

  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;
  const supplierIdNum = supplierId ? parseInt(supplierId, 10) : 0;

  // Fetch data
  const {
    data: rfp,
    isLoading: isLoadingRFP,
    error: rfpError,
  } = useRFPForQuotation(rfpIdNum);
  const { data: vendor } = useQuery({
    queryKey: ['vendor', supplierIdNum],
    queryFn: () => vendorApi.getVendorById(supplierIdNum),
    enabled: !!supplierIdNum,
  });
  const submitQuotationMutation = useSubmitQuotation();

  // Form state
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<QuotationItemForm[]>([]);

  // Initialize form when RFP loads
  useEffect(() => {
    if (rfp?.items) {
      // Auto-generate quotation number
      const quotNum = `QUOT${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      setQuotationNumber(quotNum);

      // Set payment terms from RFP
      setPaymentTerms(rfp.paymentTerms || '');

      // Initialize items
      const initialItems: QuotationItemForm[] = rfp.items.map(item => ({
        rfpItemId: item.id!,
        itemName: item.itemName,
        quantity: item.quantity,
        unitOfMeasurement: item.unitOfMeasurement,
        unitPrice: item.indicativePrice || 0,
        targetUnitPrice: item.unitPrice || 0,
        taxRate: 0,
        taxAmount: 0,
        totalPrice: 0,
        remarks: '',
      }));
      setItems(initialItems);
    }
  }, [rfp]);

  // Calculate totals
  const { subtotal, totalTax, grandTotal } = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal + totalTax;
    return { subtotal, totalTax, grandTotal };
  }, [items]);

  // Handle item field change
  const handleItemChange = (
    index: number,
    field: keyof QuotationItemForm,
    value: any
  ) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };

      // Recalculate if price or tax changed
      if (field === 'unitPrice' || field === 'taxRate') {
        const item = newItems[index];
        const itemTotal = item.unitPrice * item.quantity;
        item.taxAmount = (itemTotal * item.taxRate) / 100;
        item.totalPrice = itemTotal + item.taxAmount;
      }

      return newItems;
    });
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!quotationNumber || !quotationDate) {
      return;
    }

    // Check if all items have unit prices
    const hasEmptyPrices = items.some(
      item => !item.unitPrice || item.unitPrice <= 0
    );
    if (hasEmptyPrices) {
      alert('Please enter unit prices for all items');
      return;
    }

    // Prepare quotation data
    const quotationItems: RFPQuotationItem[] = items.map(item => ({
      rfpItemId: item.rfpItemId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      netPrice: item.totalPrice,
      remarks: item.remarks,
      technicalCompliance: true,
      commercialCompliance: true,
    }));

    const quotation: RFPQuotation = {
      rfpId: rfpIdNum,
      supplierId: supplierIdNum,
      supplierName: vendor?.name,
      quotationNumber,
      quotationDate,
      paymentTerms,
      remarks,
      totalAmount: subtotal,
      taxAmount: totalTax,
      netAmount: grandTotal,
      currency: 'INR',
      status: QuotationStatus.SUBMITTED,
      items: quotationItems,
    };

    submitQuotationMutation.mutate(
      { rfpId: rfpIdNum, quotation },
      {
        onSuccess: () => {
          navigate('/rfp/submit-quotation');
        },
      }
    );
  };

  if (isLoadingRFP) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gray-200 rounded-lg animate-pulse'></div>
              <div>
                <div className='w-32 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='w-24 h-4 bg-gray-200 rounded animate-pulse mt-1'></div>
              </div>
            </div>
            <div className='w-24 h-10 bg-gray-200 rounded-md animate-pulse'></div>
          </div>

          {/* Content Skeleton */}
          <div className='bg-white rounded-lg border border-gray-200 p-8'>
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading RFP details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rfpError || !rfp) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/submit-quotation')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>Submit RFP</h1>
          </div>

          {/* Error Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-6 max-w-2xl'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <h3 className='text-base font-semibold text-gray-900'>
                  Error Loading RFP
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {rfpError instanceof Error
                    ? rfpError.message
                    : 'RFP not found'}
                </p>
                <button
                  onClick={() => navigate('/rfp/submit-quotation')}
                  className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
                >
                  <ArrowLeft size={15} />
                  Return to RFP List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp/submit-quotation')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Submit RFP
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                {vendor?.name || 'Supplier'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitQuotationMutation.isPending}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {submitQuotationMutation.isPending ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Quotation Details Card */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-base font-semibold text-gray-900 mb-5'>
                Quotation Details
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> RFP No
                  </label>
                  <input
                    type='text'
                    value={rfp.rfpNumber}
                    readOnly
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Payment Terms
                  </label>
                  <input
                    type='text'
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Quotation Ref No
                  </label>
                  <input
                    type='text'
                    value={quotationNumber}
                    readOnly
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Quotation Ref Date
                  </label>
                  <input
                    type='date'
                    value={quotationDate}
                    onChange={e => setQuotationDate(e.target.value)}
                    required
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Remarks
                  </label>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows={3}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                    placeholder='Enter any additional remarks...'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Details Section Header */}
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-semibold text-gray-900'>
              Item Details
            </h2>
            <div className='bg-white rounded-lg border border-gray-200 px-4 py-3'>
              <p className='text-xs text-gray-500'>Grand Total</p>
              <p className='text-lg font-bold text-violet-600'>
                ₹
                {grandTotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Items Table Card */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-[#fafbfc]'>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                      Item Name
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                      Remarks
                    </th>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                      Quantity
                    </th>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                      <span className='text-red-500'>*</span> Unit Price
                    </th>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                      Target Price
                    </th>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                      Tax %
                    </th>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                      Tax Amount
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {items.map((item, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3.5 text-sm text-gray-700'>
                        {item.itemName}
                      </td>
                      <td className='px-4 py-3.5'>
                        <input
                          type='text'
                          value={item.remarks}
                          onChange={e =>
                            handleItemChange(index, 'remarks', e.target.value)
                          }
                          placeholder='Enter remarks'
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                        />
                      </td>
                      <td className='px-4 py-3.5 text-center text-sm text-gray-700'>
                        {item.quantity} {item.unitOfMeasurement || ''}
                      </td>
                      <td className='px-4 py-3.5'>
                        <input
                          type='number'
                          step='0.01'
                          min='0'
                          value={item.unitPrice}
                          onChange={e =>
                            handleItemChange(
                              index,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                          className='w-28 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                        />
                      </td>
                      <td className='px-4 py-3.5 text-center text-sm text-gray-500'>
                        ₹
                        {item.targetUnitPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-4 py-3.5'>
                        <input
                          type='number'
                          step='0.01'
                          min='0'
                          max='100'
                          value={item.taxRate}
                          onChange={e =>
                            handleItemChange(
                              index,
                              'taxRate',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='w-20 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                        />
                      </td>
                      <td className='px-4 py-3.5 text-center text-sm text-gray-700'>
                        ₹
                        {item.taxAmount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-4 py-3.5 text-right text-sm font-medium text-gray-900'>
                        ₹
                        {item.totalPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total Row */}
            <div className='px-6 py-4 bg-white border-t border-gray-200 flex justify-end'>
              <div className='flex items-center gap-8'>
                <span className='text-sm font-semibold text-gray-600'>
                  Grand Total
                </span>
                <span className='text-lg font-bold text-gray-900'>
                  ₹
                  {grandTotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuotationFormPage;
