/**
 * Approval Detail Page
 * Allows management to review finalized vendor selections and approve/reject
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Calendar,
  Package,
  User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { rfpApi } from '../services/rfpApi';
import { useApproveRejectRFP } from '../hooks/useApproval';

export const ApprovalDetailPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;

  const {
    data: rfp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rfp', rfpIdNum],
    queryFn: () => rfpApi.getRFPById(rfpIdNum),
    enabled: !!rfpIdNum,
  });

  const approveRejectMutation = useApproveRejectRFP();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const handleApprove = () => {
    approveRejectMutation.mutate(
      {
        rfpId: rfpIdNum,
        action: 'APPROVE',
        remarks: 'Approved by management',
      },
      {
        onSuccess: () => {
          navigate('/rfp/approval');
        },
      }
    );
  };

  const handleReject = () => {
    if (!rejectionRemarks.trim()) {
      alert('Please provide rejection remarks');
      return;
    }

    approveRejectMutation.mutate(
      {
        rfpId: rfpIdNum,
        action: 'REJECT',
        remarks: rejectionRemarks,
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          navigate('/rfp/approval');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/approval')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>Review RFP</h1>
          </div>
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
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

  if (error || !rfp) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/approval')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>Review RFP</h1>
          </div>
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
                  {error instanceof Error ? error.message : 'RFP not found'}
                </p>
                <button
                  onClick={() => navigate('/rfp/approval')}
                  className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
                >
                  <ArrowLeft size={15} />
                  Return to Approval List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quotations = rfp.quotations || [];
  const selectedQuotations = quotations.filter(q => q.isSelected);

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp/approval')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Review RFP
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>{rfp.rfpNumber}</p>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={approveRejectMutation.isPending}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <X size={15} />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={approveRejectMutation.isPending}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {approveRejectMutation.isPending ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>Approve</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className='space-y-6'>
          {/* RFP Info Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              RFP Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase'>
                  RFP Number
                </p>
                <p className='mt-1 text-sm font-semibold text-gray-900'>
                  {rfp.rfpNumber}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase'>
                  Request Date
                </p>
                <p className='mt-1 text-sm text-gray-900'>
                  {new Date(rfp.requestDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase'>
                  Requested By
                </p>
                <p className='mt-1 text-sm text-gray-900'>
                  {rfp.requestedBy || 'N/A'}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase'>
                  Department
                </p>
                <p className='mt-1 text-sm text-gray-900'>
                  {rfp.department || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Selected Vendors */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Selected Vendors
              </h2>
              <p className='text-sm text-gray-600 mt-1'>
                Review the vendor selections made by the purchase team
              </p>
            </div>

            {selectedQuotations.length === 0 ? (
              <div className='p-8 text-center'>
                <AlertCircle
                  size={48}
                  className='mx-auto text-yellow-300 mb-3'
                />
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No Vendors Selected
                </h3>
                <p className='text-gray-600 text-sm'>
                  No vendor selections found for this RFP
                </p>
              </div>
            ) : (
              <div className='divide-y divide-gray-200'>
                {selectedQuotations.map(quotation => (
                  <div key={quotation.id} className='p-6'>
                    {/* Quotation Header */}
                    <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4'>
                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div className='flex items-center'>
                          <Building2 size={16} className='text-gray-400 mr-2' />
                          <div>
                            <p className='text-xs text-gray-500'>
                              Selected Supplier
                            </p>
                            <p className='text-sm font-semibold text-gray-900'>
                              {quotation.supplierName}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center'>
                          <Package size={16} className='text-gray-400 mr-2' />
                          <div>
                            <p className='text-xs text-gray-500'>
                              Quotation Number
                            </p>
                            <p className='text-sm font-semibold text-gray-900'>
                              {quotation.quotationNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center'>
                          <Calendar size={16} className='text-gray-400 mr-2' />
                          <div>
                            <p className='text-xs text-gray-500'>
                              Quotation Date
                            </p>
                            <p className='text-sm text-gray-900'>
                              {quotation.quotationDate
                                ? new Date(
                                    quotation.quotationDate
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Total Amount</p>
                          <p className='text-sm font-bold text-green-600'>
                            ₹
                            {(
                              quotation.netAmount ||
                              quotation.totalAmount ||
                              0
                            ).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Selection Remarks */}
                    {quotation.remarks && (
                      <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                        <p className='text-xs font-medium text-blue-800 mb-1'>
                          Selection Remarks:
                        </p>
                        <p className='text-sm text-blue-700'>
                          {quotation.remarks}
                        </p>
                      </div>
                    )}

                    {/* Quotation Items */}
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                          <tr>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                              Item Name
                            </th>
                            <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
                              Quantity
                            </th>
                            <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                              Unit Price
                            </th>
                            <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
                              Tax %
                            </th>
                            <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                              Total Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {quotation.items && quotation.items.length > 0 ? (
                            quotation.items.map((item, itemIndex) => (
                              <tr key={itemIndex}>
                                <td className='px-4 py-2 text-sm text-gray-900'>
                                  {item.itemName}
                                </td>
                                <td className='px-4 py-2 text-center text-sm text-gray-600'>
                                  {item.quantity}
                                </td>
                                <td className='px-4 py-2 text-right text-sm text-gray-900'>
                                  ₹
                                  {item.unitPrice.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className='px-4 py-2 text-center text-sm text-gray-600'>
                                  {item.taxRate || 0}%
                                </td>
                                <td className='px-4 py-2 text-right text-sm font-medium text-gray-900'>
                                  ₹
                                  {(item.totalPrice || 0).toLocaleString(
                                    'en-IN',
                                    { minimumFractionDigits: 2 }
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className='px-4 py-4 text-center text-sm text-gray-500'
                              >
                                No items available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Quotations for Reference */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                All Quotations (Reference)
              </h2>
              <p className='text-sm text-gray-600 mt-1'>
                All quotations received for comparison
              </p>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Supplier Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Quotation Number
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Quotation Date
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                      Total Amount
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Selected
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {quotations.map(quotation => (
                    <tr
                      key={quotation.id}
                      className={quotation.isSelected ? 'bg-green-50' : ''}
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {quotation.supplierName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {quotation.quotationNumber || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {quotation.quotationDate
                          ? new Date(
                              quotation.quotationDate
                            ).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
                        ₹
                        {(
                          quotation.netAmount ||
                          quotation.totalAmount ||
                          0
                        ).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        {quotation.isSelected ? (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            <Check size={12} className='mr-1' />
                            Selected
                          </span>
                        ) : (
                          <span className='text-xs text-gray-400'>
                            Not Selected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Reject RFP
              </h3>
            </div>
            <div className='px-6 py-4'>
              <p className='text-sm text-gray-600 mb-4'>
                Please provide a reason for rejecting this RFP. The vendor
                selection will be sent back to the purchase team for
                re-selection.
              </p>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Rejection Remarks <span className='text-red-600'>*</span>
              </label>
              <textarea
                value={rejectionRemarks}
                onChange={e => setRejectionRemarks(e.target.value)}
                rows={4}
                placeholder='Enter reason for rejection...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
              />
            </div>
            <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3'>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionRemarks('');
                }}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={
                  approveRejectMutation.isPending || !rejectionRemarks.trim()
                }
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
              >
                {approveRejectMutation.isPending ? (
                  <Loader2 size={16} className='animate-spin' />
                ) : (
                  <X size={16} />
                )}
                <span>Reject RFP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalDetailPage;
