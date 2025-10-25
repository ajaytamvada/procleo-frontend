/**
 * PO Approval Detail Page
 * Allows reviewers to approve or reject a pending Purchase Order
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  Building,
  User,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { POStatus } from '../types';
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder
} from '../hooks/usePurchaseOrders';

export const POApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const poId = parseInt(id || '0');

  const [approvalDate, setApprovalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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
      toast.error(`Approval date should be greater than or equal to PO date: ${formatDate(po.poDate)}`);
      return;
    }

    try {
      setIsProcessing(true);
      await approveMutation.mutateAsync({
        id: poId,
        approvedBy: 'Current User' // TODO: Get from auth context
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
        reason: approvalRemarks
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading PO details...</p>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading PO</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Purchase Order not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if PO is in correct status for approval
  if (po.status !== POStatus.SUBMITTED) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-yellow-800 font-medium">Cannot Approve/Reject</h3>
            <p className="text-yellow-700 text-sm mt-1">
              This Purchase Order is in {po.status} status and cannot be approved or rejected.
            </p>
            <button
              onClick={() => navigate('/purchase-orders/approve')}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              Back to Approval List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/purchase-orders/approve')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Approve Purchase Order</h1>
              <p className="text-sm text-gray-600 mt-1">PO Number: {po.poNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Approve
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Supplier Info Banner */}
        {po.supplierName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Building className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Supplier</h4>
                <p className="text-blue-700 text-sm mt-0.5">{po.supplierName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Order Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Number
                </label>
                <input
                  type="text"
                  value={po.poNumber || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raised By
                </label>
                <input
                  type="text"
                  value={po.raisedBy || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PR Number
                </label>
                <input
                  type="text"
                  value={po.prNumber || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-red-500">*</span> Approval/Rejection Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={approvalDate}
                    onChange={(e) => setApprovalDate(e.target.value)}
                    min={po.poDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={po.deliveryDate ? formatDate(po.deliveryDate) : 'N/A'}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={po.paymentTerms || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={po.poDate ? formatDate(po.poDate) : 'N/A'}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quotation Number
                </label>
                <input
                  type="text"
                  value={po.quotationNumber || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Third Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFP Number
                </label>
                <input
                  type="text"
                  value={po.rfpNumber || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={po.department || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Group
                </label>
                <input
                  type="text"
                  value={po.approvalGroup || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <input
                  type="text"
                  value={po.termsConditions || 'N/A'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={po.remarks || ''}
                readOnly
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval/Rejection Remarks
              </label>
              <textarea
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Enter your approval or rejection remarks (2000 characters max)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {approvalRemarks.length} / 2000 characters
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Item Details</h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-1
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-2
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-1 Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-2 Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {po.items && po.items.length > 0 ? (
                    po.items.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.remarks || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.deliveryDate ? formatDate(item.deliveryDate) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ₹{item.unitPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.tax1Type || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.tax2Type || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ₹{item.tax1Value?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ₹{item.tax2Value?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ₹{item.grandTotal?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                {po.items && po.items.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={9} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Grand Total:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        ₹{po.grandTotal?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POApprovalDetailPage;
