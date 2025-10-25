/**
 * Re-Submit Quotation Form Page
 * Form for modifying existing quotations with price validation
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useQuotationForEdit, useUpdateQuotation } from '../hooks/useReSubmitQuotation';
import { QuotationStatus } from '../types';
import type { RFPQuotation, RFPQuotationItem } from '../types';

interface QuotationItemForm {
  id?: number;
  rfpItemId: number;
  itemName: string;
  quantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
  originalUnitPrice: number; // Track original price for validation
  targetUnitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  remarks: string;
}

export const ReSubmitQuotationFormPage: React.FC = () => {
  const { rfpId, quotationId } = useParams<{ rfpId: string; quotationId: string }>();
  const navigate = useNavigate();

  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;
  const quotationIdNum = quotationId ? parseInt(quotationId, 10) : 0;

  // Fetch quotation for editing
  const { data, isLoading: isLoadingData, error } = useQuotationForEdit(rfpIdNum, quotationIdNum);
  const updateQuotationMutation = useUpdateQuotation();

  // Form state
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [items, setItems] = useState<QuotationItemForm[]>([]);

  // Initialize form when quotation loads
  useEffect(() => {
    if (data?.quotation && data?.rfp) {
      const quotation = data.quotation;

      // Set quotation header fields
      setQuotationNumber(quotation.quotationNumber || '');
      setQuotationDate(quotation.quotationDate || new Date().toISOString().split('T')[0]);
      setPaymentTerms(quotation.paymentTerms || data.rfp.paymentTerms || '');
      setRemarks(quotation.remarks || '');
      setNegotiationNotes(quotation.negotiationNotes || '');

      // Initialize items with existing quotation data
      if (quotation.items && quotation.items.length > 0) {
        const initialItems: QuotationItemForm[] = quotation.items.map(item => ({
          id: item.id,
          rfpItemId: item.rfpItemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unitOfMeasurement: data.rfp.items?.find(rfpItem => rfpItem.id === item.rfpItemId)?.unitOfMeasurement,
          unitPrice: item.unitPrice,
          originalUnitPrice: item.unitPrice, // Store original for validation
          targetUnitPrice: data.rfp.items?.find(rfpItem => rfpItem.id === item.rfpItemId)?.unitPrice || 0,
          taxRate: item.taxRate || 0,
          taxAmount: item.taxAmount || 0,
          totalPrice: item.totalPrice || 0,
          remarks: item.remarks || '',
        }));
        setItems(initialItems);
      }
    }
  }, [data]);

  // Calculate totals
  const { subtotal, totalTax, grandTotal } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subtotal + totalTax;
    return { subtotal, totalTax, grandTotal };
  }, [items]);

  // Handle item field change with price validation
  const handleItemChange = (index: number, field: keyof QuotationItemForm, value: any) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const item = { ...newItems[index] };

      // Validate unit price: cannot be greater than original price
      if (field === 'unitPrice') {
        const newPrice = typeof value === 'number' ? value : parseFloat(value) || 0;
        if (newPrice > item.originalUnitPrice) {
          alert(`Unit price cannot be greater than original unit price (₹${item.originalUnitPrice.toFixed(2)})`);
          return prevItems; // Don't update
        }
        (item as Record<string, any>)[field] = newPrice;
      } else {
        (item as Record<string, any>)[field] = value;
      }

      // Recalculate if price or tax changed
      if (field === 'unitPrice' || field === 'taxRate') {
        const itemTotal = item.unitPrice * item.quantity;
        item.taxAmount = (itemTotal * item.taxRate) / 100;
        item.totalPrice = itemTotal + item.taxAmount;
      }

      newItems[index] = item;
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
    const hasEmptyPrices = items.some(item => !item.unitPrice || item.unitPrice <= 0);
    if (hasEmptyPrices) {
      alert('Please enter unit prices for all items');
      return;
    }

    // Final validation: ensure no prices exceed original prices
    const priceExceeded = items.find(item => item.unitPrice > item.originalUnitPrice);
    if (priceExceeded) {
      alert(`Unit price for "${priceExceeded.itemName}" cannot exceed original price`);
      return;
    }

    // Prepare quotation data
    const quotationItems: RFPQuotationItem[] = items.map(item => ({
      id: item.id,
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
      id: quotationIdNum,
      rfpId: rfpIdNum,
      supplierId: data?.quotation.supplierId || 0,
      supplierName: data?.quotation.supplierName,
      quotationNumber,
      quotationDate,
      paymentTerms,
      remarks,
      negotiationNotes,
      totalAmount: subtotal,
      taxAmount: totalTax,
      netAmount: grandTotal,
      currency: 'INR',
      status: QuotationStatus.NEGOTIATION, // Update status to NEGOTIATION
      items: quotationItems,
    };

    updateQuotationMutation.mutate(
      { rfpId: rfpIdNum, quotationId: quotationIdNum, quotation },
      {
        onSuccess: () => {
          navigate('/rfp/resubmit-quotation');
        },
      }
    );
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading quotation details...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Quotation</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Quotation not found'}
            </p>
            <button
              onClick={() => navigate('/rfp/resubmit-quotation')}
              className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
            >
              Return to Quotation List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/rfp/resubmit-quotation')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Modify Quotation</h1>
              <p className="text-sm text-gray-600">{data.quotation.supplierName || 'Supplier'}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={updateQuotationMutation.isPending}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateQuotationMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Update</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
          {/* Price Validation Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-800 font-medium">Price Validation Rule</h3>
              <p className="text-yellow-700 text-sm mt-1">
                New unit prices cannot be greater than the original unit prices. You can only reduce or maintain prices during re-submission.
              </p>
            </div>
          </div>

          {/* Header Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-600">*</span> RFP No
                </label>
                <input
                  type="text"
                  value={data.rfp.rfpNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-600">*</span> Quotation Ref No
                </label>
                <input
                  type="text"
                  value={quotationNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-600">*</span> Quotation Ref Date
                </label>
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Negotiation Notes
              </label>
              <textarea
                value={negotiationNotes}
                onChange={(e) => setNegotiationNotes(e.target.value)}
                rows={2}
                placeholder="Add notes about this re-submission (e.g., reasons for price changes)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Original Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      <span className="text-red-600">*</span> New Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Target Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tax %</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tax Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {item.quantity} {item.unitOfMeasurement || ''}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                        ₹{item.originalUnitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={item.originalUnitPrice}
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                          className={`w-24 px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 ${
                            item.unitPrice > item.originalUnitPrice
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-purple-500'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        ₹{item.targetUnitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        ₹{item.taxAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={8} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Grand Total:
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-purple-600">
                      ₹{grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReSubmitQuotationFormPage;
