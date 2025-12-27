/**
 * PO Approval Detail Page
 * Allows reviewers to approve or reject a pending Purchase Order
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  Building,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { POStatus } from '../types';
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
} from '../hooks/usePurchaseOrders';

export const POApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const poId = parseInt(id || '0');

  const [approvalDate, setApprovalDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: po, isLoading, error } = usePurchaseOrder(poId);
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const handleApprove = async () => {
    if (!approvalDate) {
      toast.error('Approval date is required');
      return;
    }

    // Validate approval date is >= PO date
    if (po?.poDate && approvalDate < po.poDate) {
      toast.error(
        `Approval date should be greater than or equal to PO date: ${formatDate(po.poDate)}`
      );
      return;
    }

    try {
      setIsProcessing(true);
      await approveMutation.mutateAsync({
        id: poId,
        approvedBy: 'Current User', // TODO: Get from auth context
      });
      navigate('/purchase-orders/approve');
    } catch (error) {
      console.error('Error approving PO:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!approvalDate) {
      toast.error('Rejection date is required');
      return;
    }

    if (!approvalRemarks || approvalRemarks.trim().length === 0) {
      toast.error('Rejection remarks are required');
      return;
    }

    try {
      setIsProcessing(true);
      await rejectMutation.mutateAsync({
        id: poId,
        reason: approvalRemarks,
      });
      navigate('/purchase-orders/approve');
    } catch (error) {
      console.error('Error rejecting PO:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
          <span className='text-2xl'>⚠️</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Error Loading PO Details
        </h3>
        <p className='text-gray-500 mb-4'>
          {error instanceof Error
            ? error.message
            : 'Failed to load purchase order details. Please try again.'}
        </p>
        <button
          onClick={() => navigate('/purchase-orders/approve')}
          className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          Go Back
        </button>
      </div>
    );
  }

  // Check if PO is in correct status for approval
  if (po.status !== POStatus.SUBMITTED) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4'>
          <AlertCircle className='w-8 h-8 text-yellow-600' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Cannot Approve/Reject
        </h3>
        <p className='text-gray-500 mb-4'>
          This Purchase Order is in {po.status} status and cannot be approved or
          rejected.
        </p>
        <button
          onClick={() => navigate('/purchase-orders/approve')}
          className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          Back to Approval List
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/purchase-orders/approve')}
            className='text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='h-6 w-6' />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-800'>PO Approval</h1>
            <p className='text-sm text-gray-500 mt-1'>
              PO Number: {po.poNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='space-y-6'>
        {/* Supplier Info Banner */}
        {po.supplierName && (
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
            <div className='flex items-center'>
              <Building className='w-5 h-5 text-blue-600 mr-3' />
              <div>
                <h4 className='text-sm font-medium text-blue-900'>Supplier</h4>
                <p className='text-blue-700 text-sm mt-0.5'>
                  {po.supplierName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Purchase Order Details
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Left Column */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  PO Number
                </label>
                <input
                  type='text'
                  value={po.poNumber || ''}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Raised By
                </label>
                <input
                  type='text'
                  value={po.raisedBy || ''}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  PR Number
                </label>
                <input
                  type='text'
                  value={po.prNumber || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  <span className='text-red-500'>*</span> Approval/Rejection
                  Date
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    value={approvalDate}
                    onChange={e => setApprovalDate(e.target.value)}
                    min={po.poDate}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Delivery Date
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={
                      po.deliveryDate ? formatDate(po.deliveryDate) : 'N/A'
                    }
                    readOnly
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                  />
                  <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Payment Terms
                </label>
                <input
                  type='text'
                  value={po.paymentTerms || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  PO Date
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={po.poDate ? formatDate(po.poDate) : 'N/A'}
                    readOnly
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                  />
                  <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Quotation Number
                </label>
                <input
                  type='text'
                  value={po.quotationNumber || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>
            </div>

            {/* Third Column */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  RFP Number
                </label>
                <input
                  type='text'
                  value={po.rfpNumber || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Department
                </label>
                <input
                  type='text'
                  value={po.department || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Approval Group
                </label>
                <input
                  type='text'
                  value={po.approvalGroup || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Terms & Conditions
                </label>
                <input
                  type='text'
                  value={po.termsConditions || 'N/A'}
                  readOnly
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
                />
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className='mt-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Remarks
              </label>
              <textarea
                value={po.remarks || ''}
                readOnly
                rows={3}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Approval/Rejection Remarks
              </label>
              <textarea
                value={approvalRemarks}
                onChange={e => setApprovalRemarks(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder='Enter your approval or rejection remarks (2000 characters max)...'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <div className='text-xs text-gray-500 mt-1'>
                {approvalRemarks.length} / 2000 characters
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Item Details
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-[#F7F8FA]'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Item Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Remarks
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Delivery Date
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Quantity
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Tax-1
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Tax-2
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Tax-1 Value
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Tax-2 Value
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Grand Total
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {po.items && po.items.length > 0 ? (
                  po.items.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        {item.itemName || '-'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        {item.remarks || '-'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        {item.deliveryDate
                          ? formatDate(item.deliveryDate)
                          : '-'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        {item.quantity || 0}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        ₹{item.unitPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        {item.tax1Type || '-'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        {item.tax2Type || '-'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        ₹{item.tax1Value?.toFixed(2) || '0.00'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        ₹{item.tax2Value?.toFixed(2) || '0.00'}
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-gray-700'>
                        ₹{item.grandTotal?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className='px-4 py-8 text-center text-gray-500'
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
              {po.items && po.items.length > 0 && (
                <tfoot className='bg-[#F7F8FA] border-t border-gray-200'>
                  <tr>
                    <td
                      colSpan={9}
                      className='px-4 py-3 text-right text-sm font-medium text-gray-900'
                    >
                      Grand Total:
                    </td>
                    <td className='px-4 py-3 text-sm font-bold text-gray-900'>
                      ₹{po.grandTotal?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-end'>
            <div className='flex space-x-3'>
              <button
                onClick={() => navigate('/purchase-orders/approve')}
                disabled={isProcessing}
                className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className='px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
              >
                {isProcessing ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  <X className='w-4 h-4 mr-2' />
                )}
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className='px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
              >
                {isProcessing ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  <Check className='w-4 h-4 mr-2' />
                )}
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POApprovalDetailPage;
