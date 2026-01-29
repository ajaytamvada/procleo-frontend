import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Send,
  Calculator,
  AlertCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import {
  useVendorQuotation,
  useResubmitVendorQuotation,
  VendorQuotationItem,
} from '../hooks/useVendorPortal';

interface QuotationItemForm {
  rfpItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  remarks: string;
}

export default function VendorResubmitQuotationPage() {
  const { quotationId } = useParams<{ quotationId: string }>();
  const navigate = useNavigate();
  const quotationIdNum = quotationId ? parseInt(quotationId, 10) : undefined;

  const {
    data: quotation,
    isLoading,
    error,
  } = useVendorQuotation(quotationIdNum);
  const resubmitMutation = useResubmitVendorQuotation();

  const [quotationNumber, setQuotationNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<QuotationItemForm[]>([]);

  // Initialize form from existing quotation
  useEffect(() => {
    if (quotation) {
      setQuotationNumber(quotation.quotationNumber || '');
      setPaymentTerms(quotation.paymentTerms || '');
      setRemarks(quotation.remarks || '');

      if (quotation.items && quotation.items.length > 0) {
        const initialItems: QuotationItemForm[] = quotation.items.map(
          (item: VendorQuotationItem) => ({
            rfpItemId: item.rfpItemId,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            taxRate: item.taxRate || 18,
            taxAmount: item.taxAmount || 0,
            totalPrice: item.totalPrice || 0,
            remarks: item.remarks || '',
          })
        );
        setItems(initialItems);
      }
    }
  }, [quotation]);

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = (itemTotal * item.taxRate) / 100;
      subtotal += itemTotal;
      totalTax += itemTax;
    });

    return {
      subtotal,
      taxAmount: totalTax,
      netAmount: subtotal + totalTax,
    };
  }, [items]);

  // Update item calculations
  const updateItem = (
    index: number,
    field: keyof QuotationItemForm,
    value: any
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate derived fields
      if (
        field === 'unitPrice' ||
        field === 'taxRate' ||
        field === 'quantity'
      ) {
        const item = updated[index];
        const baseTotal = item.quantity * item.unitPrice;
        item.taxAmount = (baseTotal * item.taxRate) / 100;
        item.totalPrice = baseTotal + item.taxAmount;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quotationIdNum) return;

    // Validate all items have prices
    const invalidItems = items.filter(item => item.unitPrice <= 0);
    if (invalidItems.length > 0) {
      alert('Please enter unit price for all items');
      return;
    }

    const quotationData = {
      quotationNumber,
      quotationDate: new Date().toISOString().split('T')[0],
      paymentTerms,
      remarks,
      currency: 'INR',
      totalAmount: totals.subtotal,
      taxAmount: totals.taxAmount,
      netAmount: totals.netAmount,
      items: items.map(item => ({
        rfpItemId: item.rfpItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        totalPrice: item.totalPrice,
        remarks: item.remarks,
      })),
    };

    try {
      await resubmitMutation.mutateAsync({
        quotationId: quotationIdNum,
        data: quotationData,
      });
      navigate('/vendor/quotations');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-violet-600' />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div>
            <h3 className='font-medium text-red-800'>
              Error Loading Quotation
            </h3>
            <p className='text-red-600 text-sm mt-1'>
              {(error as Error)?.message || 'Unable to load quotation details'}
            </p>
            <Link
              to='/vendor/quotations'
              className='text-red-700 hover:text-red-800 text-sm font-medium mt-2 inline-block'
            >
              ← Back to My Quotations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            to='/vendor/quotations'
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Resubmit Quotation
            </h1>
            <p className='text-gray-500'>
              {quotation.quotationNumber} - RFP: {quotation.rfpNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Negotiation Notes */}
      {quotation.negotiationNotes && (
        <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <MessageSquare className='w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5' />
            <div>
              <h3 className='font-medium text-orange-800'>
                Negotiation Notes from Buyer
              </h3>
              <p className='text-orange-700 mt-1'>
                {quotation.negotiationNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Info */}
      <div className='bg-violet-50 border border-violet-200 rounded-lg p-4'>
        <div className='grid grid-cols-3 gap-4'>
          <div className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-violet-600' />
            <span className='text-sm text-gray-600'>Quotation:</span>
            <span className='text-sm font-medium'>
              {quotation.quotationNumber}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-violet-600' />
            <span className='text-sm text-gray-600'>Original Date:</span>
            <span className='text-sm font-medium'>
              {quotation.quotationDate
                ? new Date(quotation.quotationDate).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <DollarSign className='w-4 h-4 text-violet-600' />
            <span className='text-sm text-gray-600'>Previous Amount:</span>
            <span className='text-sm font-medium'>
              ₹
              {(quotation.netAmount || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Quotation Details */}
        <div className='bg-white border rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Quotation Details
          </h2>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Quotation Number
              </label>
              <input
                type='text'
                value={quotationNumber}
                disabled
                className='w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Payment Terms
              </label>
              <input
                type='text'
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                placeholder='e.g., Net 30 days'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Remarks
              </label>
              <input
                type='text'
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder='Any additional notes'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className='bg-white border rounded-lg overflow-hidden'>
          <div className='p-4 border-b bg-gray-50'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Update Item Prices
            </h2>
            <p className='text-sm text-gray-500'>
              Revise your prices based on negotiation feedback
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full table-fixed'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Item
                  </th>
                  <th className='w-[80px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Qty
                  </th>
                  <th className='w-[120px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Unit Price (₹)
                  </th>
                  <th className='w-[100px] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Tax Rate (%)
                  </th>
                  <th className='w-[100px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Tax Amount
                  </th>
                  <th className='w-[100px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Total
                  </th>
                  <th className='w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {items.map((item, index) => (
                  <tr key={item.rfpItemId} className='hover:bg-gray-50'>
                    <td className='w-[200px] px-4 py-3'>
                      <div className='font-medium text-gray-900'>
                        {item.itemName}
                      </div>
                    </td>
                    <td className='w-[80px] px-4 py-3 text-center'>
                      <span className='text-gray-600'>{item.quantity}</span>
                    </td>
                    <td className='w-[120px] px-4 py-3 text-center'>
                      <input
                        type='number'
                        value={item.unitPrice || ''}
                        onChange={e =>
                          updateItem(
                            index,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min='0'
                        step='0.01'
                        required
                        className='w-full px-2 py-1 border rounded text-right focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                        placeholder='0.00'
                      />
                    </td>
                    <td className='w-[100px] px-4 py-3 text-center'>
                      <input
                        type='number'
                        value={item.taxRate}
                        onChange={e =>
                          updateItem(
                            index,
                            'taxRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min='0'
                        max='100'
                        className='w-full px-2 py-1 border rounded text-center focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      />
                    </td>
                    <td className='w-[100px] px-4 py-3 text-right text-gray-600'>
                      ₹
                      {item.taxAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='w-[100px] px-4 py-3 text-right font-medium text-gray-900'>
                      ₹
                      {item.totalPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='w-[150px] px-4 py-3'>
                      <input
                        type='text'
                        value={item.remarks}
                        onChange={e =>
                          updateItem(index, 'remarks', e.target.value)
                        }
                        className='w-full px-2 py-1 border rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                        placeholder='Notes'
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary & Submit */}
        <div className='bg-white border rounded-lg p-6'>
          <div className='flex justify-between items-start'>
            {/* Totals */}
            <div className='flex items-center gap-2 text-gray-500'>
              <Calculator className='w-5 h-5' />
              <span>Updated Quotation Total</span>
            </div>
            <div className='text-right space-y-2'>
              <div className='flex justify-between gap-8'>
                <span className='text-gray-600'>Subtotal:</span>
                <span className='font-medium'>
                  ₹
                  {totals.subtotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between gap-8'>
                <span className='text-gray-600'>Tax:</span>
                <span className='font-medium'>
                  ₹
                  {totals.taxAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between gap-8 pt-2 border-t'>
                <span className='text-lg font-semibold'>Net Amount:</span>
                <span className='text-lg font-bold text-violet-600'>
                  ₹
                  {totals.netAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className='mt-6 flex justify-end gap-4'>
            <Link
              to='/vendor/quotations'
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={
                resubmitMutation.isPending || items.some(i => i.unitPrice <= 0)
              }
              className='px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {resubmitMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Resubmitting...
                </>
              ) : (
                <>
                  <Send className='w-4 h-4' />
                  Resubmit Quotation
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
