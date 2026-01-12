/**
 * Quotation Comparison Page
 * Displays all quotations for an RFP side-by-side for comparison and negotiation
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  useRFPForComparison,
  useNegotiateQuotation,
} from '../hooks/useNegotiateQuotation';
import { ExtendRFPDialog } from '../components/ExtendRFPDialog';

export const QuotationComparisonPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;

  const { data: rfp, isLoading, error } = useRFPForComparison(rfpIdNum);
  const negotiateMutation = useNegotiateQuotation();

  const [negotiationNotes, setNegotiationNotes] = useState<{
    [key: number]: string;
  }>({});
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);

  const handleNegotiate = (quotationId: number) => {
    negotiateMutation.mutate({
      quotationId,
      negotiationNotes:
        negotiationNotes[quotationId] || 'Request for better pricing',
    });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className=''>
          {/* Header Skeleton */}
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-8 h-8 bg-gray-200 rounded-lg animate-pulse'></div>
            <div>
              <div className='w-48 h-5 bg-gray-200 rounded animate-pulse'></div>
              <div className='w-32 h-4 bg-gray-200 rounded animate-pulse mt-1'></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className='bg-white rounded-lg border border-gray-200 p-8'>
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading quotation comparison...
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
        <div className=''>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/negotiate')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Quotation Comparison
            </h1>
          </div>

          {/* Error Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-6 max-w-2xl'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <h3 className='text-base font-semibold text-gray-900'>
                  Error Loading Quotations
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {error instanceof Error
                    ? error.message
                    : 'Quotations not found'}
                </p>
                <button
                  onClick={() => navigate('/rfp/negotiate')}
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

  // Group quotations by supplier
  const quotations = rfp.quotations || [];

  // Check if all quotations are received or date has passed
  const totalSuppliers = rfp.totalSuppliers || 0;
  const respondedSuppliers = rfp.respondedSuppliers || 0;
  const isDatePassed = new Date() > new Date(rfp.closingDate);
  const allQuotationsReceived =
    (respondedSuppliers >= totalSuppliers && totalSuppliers > 0) ||
    isDatePassed;

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp/negotiate')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Quotation Comparison
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>{rfp.rfpNumber}</p>
            </div>
          </div>
          {rfp.status === 'FLOATED' && !isDatePassed && (
            <button
              onClick={() => setIsExtendDialogOpen(true)}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all'
            >
              <Calendar size={15} />
              Extend Date
            </button>
          )}
        </div>

        {/* RFP Info Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div>
                <p className='text-xs font-medium text-gray-500 mb-1'>
                  RFP Number
                </p>
                <p className='text-sm font-semibold text-violet-600'>
                  {rfp.rfpNumber}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 mb-1'>
                  Request Date
                </p>
                <p className='text-sm text-gray-700'>
                  {new Date(rfp.requestDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 mb-1'>
                  Closing Date
                </p>
                <p className='text-sm text-gray-700'>
                  {new Date(rfp.closingDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 mb-1'>
                  Total Quotations
                </p>
                <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200'>
                  {quotations.length} Received
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert if prices are hidden */}
        {!allQuotationsReceived && (
          <div className='mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start'>
            <AlertCircle className='w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0' />
            <div>
              <p className='text-sm font-medium text-blue-800'>
                Prices are hidden
              </p>
              <p className='text-sm text-blue-600 mt-0.5'>
                Not all invited suppliers have submitted their quotations yet (
                {respondedSuppliers}/{totalSuppliers}). Wait for all suppliers
                to respond to compare prices.
              </p>
            </div>
          </div>
        )}

        {/* Quotations List */}
        <div className='space-y-6'>
          {quotations.map(quotation => (
            <div
              key={quotation.id}
              className='bg-white rounded-lg border border-gray-200 overflow-hidden'
            >
              {/* Quotation Header */}
              <div className='bg-[#fafbfc] border-b border-gray-200 px-6 py-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Building2 size={18} className='text-violet-600' />
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Supplier Name</p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {quotation.supplierName}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Quotation Number</p>
                    <p className='text-sm font-medium text-gray-700'>
                      {quotation.quotationNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Quotation Date</p>
                    <p className='text-sm text-gray-700'>
                      {quotation.quotationDate
                        ? new Date(quotation.quotationDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <p className='text-xs text-gray-500'>Payment Terms</p>
                    <p className='text-sm text-gray-700'>
                      {quotation.paymentTerms || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        quotation.status === 'SUBMITTED'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : quotation.status === 'NEGOTIATION'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {quotation.status || 'SUBMITTED'}
                    </span>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Total Amount</p>
                    <p className='text-sm font-bold text-violet-600'>
                      {allQuotationsReceived ? (
                        <>
                          ₹
                          {(
                            quotation.netAmount ||
                            quotation.totalAmount ||
                            0
                          ).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        <span className='text-gray-400'>*****</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quotation Items */}
              <div className='p-6'>
                <h3 className='text-sm font-semibold text-gray-900 mb-4'>
                  Item Details
                </h3>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-[#fafbfc]'>
                        <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                          Item Name
                        </th>
                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                          Quantity
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                          Unit Price
                        </th>
                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                          Tax %
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                          Tax Amount
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                      {quotation.items && quotation.items.length > 0 ? (
                        quotation.items.map((item, itemIndex) => (
                          <tr
                            key={itemIndex}
                            className='hover:bg-gray-50 transition-colors'
                          >
                            <td className='px-4 py-3.5 text-sm text-gray-700'>
                              {item.itemName}
                            </td>
                            <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                              {item.quantity}
                            </td>
                            <td className='px-4 py-3.5 text-right text-sm text-gray-700'>
                              {allQuotationsReceived ? (
                                <>
                                  ₹
                                  {item.unitPrice.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                  })}
                                </>
                              ) : (
                                <span className='text-gray-400'>*****</span>
                              )}
                            </td>
                            <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                              {item.taxRate || 0}%
                            </td>
                            <td className='px-4 py-3.5 text-right text-sm text-gray-700'>
                              {allQuotationsReceived ? (
                                <>
                                  ₹
                                  {(item.taxAmount || 0).toLocaleString(
                                    'en-IN',
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </>
                              ) : (
                                <span className='text-gray-400'>*****</span>
                              )}
                            </td>
                            <td className='px-4 py-3.5 text-right text-sm font-medium text-gray-900'>
                              {allQuotationsReceived ? (
                                <>
                                  ₹
                                  {(item.totalPrice || 0).toLocaleString(
                                    'en-IN',
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </>
                              ) : (
                                <span className='text-gray-400'>*****</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className='px-4 py-8 text-center text-sm text-gray-400'
                          >
                            No items available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Grand Total Row */}
                <div className='mt-4 pt-4 border-t border-gray-200 flex justify-end'>
                  <div className='flex items-center gap-8'>
                    <span className='text-sm font-semibold text-gray-600'>
                      Grand Total
                    </span>
                    <span className='text-lg font-bold text-violet-600'>
                      {allQuotationsReceived ? (
                        <>
                          ₹
                          {(
                            quotation.netAmount ||
                            quotation.totalAmount ||
                            0
                          ).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        <span className='text-gray-400'>*****</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Negotiate Section */}
              <div className='bg-[#fafbfc] border-t border-gray-200 px-6 py-4'>
                <div className='flex items-end justify-between gap-4'>
                  <div className='flex-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Negotiation Notes (Optional)
                    </label>
                    <input
                      type='text'
                      value={negotiationNotes[quotation.id!] || ''}
                      onChange={e =>
                        setNegotiationNotes({
                          ...negotiationNotes,
                          [quotation.id!]: e.target.value,
                        })
                      }
                      placeholder='Enter reason for negotiation...'
                      className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                    />
                  </div>
                  <button
                    onClick={() => handleNegotiate(quotation.id!)}
                    disabled={
                      negotiateMutation.isPending ||
                      quotation.status === 'NEGOTIATION' ||
                      rfp.status === 'APPROVED' ||
                      rfp.status === 'CANCELLED'
                    }
                    className='inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <MessageSquare size={15} />
                    {quotation.status === 'NEGOTIATION'
                      ? 'Negotiated'
                      : 'Negotiate'}
                  </button>
                </div>
                {quotation.negotiationNotes && (
                  <div className='mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
                    <p className='text-xs font-semibold text-amber-800 mb-1'>
                      Previous Negotiation Notes
                    </p>
                    <p className='text-sm text-amber-700'>
                      {quotation.negotiationNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {rfp && (
        <ExtendRFPDialog
          isOpen={isExtendDialogOpen}
          onClose={() => setIsExtendDialogOpen(false)}
          rfpId={rfp.id!}
          currentClosingDate={rfp.closingDate}
        />
      )}
    </div>
  );
};

export default QuotationComparisonPage;
