/**
 * Send For Approval Page
 * Allows finalization of vendor selection and sending RFP for management approval
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Building2,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useRFPForComparison } from '../hooks/useNegotiateQuotation';
import { useSendForApproval } from '../hooks/useSendForApproval';
import { useRfpInsights } from '../hooks/useRfpInsights';
import { AIInsightCard } from '@/components/rfp/AIInsightCard';

export const SendForApprovalPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;

  const { data: rfp, isLoading, error } = useRFPForComparison(rfpIdNum);
  const { data: insights, isLoading: isInsightsLoading } =
    useRfpInsights(rfpIdNum);
  const sendForApprovalMutation = useSendForApproval();

  const [finalizationDate, setFinalizationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [approvalGroup, setApprovalGroup] = useState('');
  const [vendorSelections, setVendorSelections] = useState<{
    [itemId: number]: {
      supplierId: number;
      supplierName: string;
      remarks: string;
    };
  }>({});
  const [competitiveBidding, setCompetitiveBidding] = useState(true);
  const [lowestBidSelected, setLowestBidSelected] = useState(true);
  const [showJustification, setShowJustification] = useState(false);
  const [expandedQuotations, setExpandedQuotations] = useState<Set<number>>(
    new Set()
  );

  const toggleQuotation = (quotationId: number) => {
    const newExpanded = new Set(expandedQuotations);
    if (newExpanded.has(quotationId)) {
      newExpanded.delete(quotationId);
    } else {
      newExpanded.add(quotationId);
    }
    setExpandedQuotations(newExpanded);
  };

  const handleVendorSelection = (
    itemId: number,
    supplierId: number,
    supplierName: string
  ) => {
    setVendorSelections({
      ...vendorSelections,
      [itemId]: {
        supplierId,
        supplierName,
        remarks: vendorSelections[itemId]?.remarks || '',
      },
    });
  };

  const handleRemarksChange = (itemId: number, remarks: string) => {
    if (vendorSelections[itemId]) {
      setVendorSelections({
        ...vendorSelections,
        [itemId]: {
          ...vendorSelections[itemId],
          remarks,
        },
      });
    }
  };

  const handleSubmit = () => {
    if (!approvalGroup) {
      alert('Please select an approval group');
      return;
    }

    const selections = Object.entries(vendorSelections).map(
      ([itemId, selection]) => ({
        quotationItemId: parseInt(itemId),
        selectedSupplierId: selection.supplierId,
        selectedSupplierName: selection.supplierName,
        selectionRemarks: selection.remarks,
      })
    );

    if (selections.length === 0) {
      alert('Please select at least one vendor');
      return;
    }

    sendForApprovalMutation.mutate(
      {
        rfpId: rfpIdNum,
        finalizationDate,
        approvalGroupId: parseInt(approvalGroup),
        competitiveBidding,
        lowestBidSelected,
        vendorSelections: selections,
      },
      {
        onSuccess: () => {
          navigate('/rfp/send-for-approval');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/send-for-approval')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Send For Approval
            </h1>
          </div>

          {/* Loading Card */}
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
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/send-for-approval')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Send For Approval
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
                  Error Loading RFP
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {error instanceof Error ? error.message : 'RFP not found'}
                </p>
                <button
                  onClick={() => navigate('/rfp/send-for-approval')}
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

  const quotations = rfp.quotations || [];

  // Group items from all quotations
  const allItems = quotations.flatMap(q => q.items || []);
  const uniqueItemNames = Array.from(
    new Set(allItems.map(item => item.itemName))
  );

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp/send-for-approval')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Send For Approval
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>{rfp.rfpNumber}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={sendForApprovalMutation.isPending}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {sendForApprovalMutation.isPending ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Send For Approval</span>
              </>
            )}
          </button>
        </div>

        <div className='space-y-6'>
          {/* RFP Info Card */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-base font-semibold text-gray-900 mb-5'>
                RFP Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase mb-1.5'>
                    RFP Number
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {rfp.rfpNumber}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase mb-1.5'>
                    Request Date
                  </p>
                  <p className='text-sm text-gray-600'>
                    {new Date(rfp.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase mb-1.5'>
                    Closing Date
                  </p>
                  <p className='text-sm text-gray-600'>
                    {new Date(rfp.closingDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 uppercase mb-1.5'>
                    Quotations Received
                  </p>
                  <p className='text-sm font-semibold text-green-600'>
                    {quotations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className='bg-gradient-to-r from-violet-600 to-indigo-700 rounded-lg shadow-lg overflow-hidden text-white'>
            <div className='p-6'>
              <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                  <Zap
                    className='w-6 h-6 text-yellow-300'
                    fill='currentColor'
                  />
                </div>
                <div>
                  <h2 className='text-lg font-bold'>
                    AI Award Recommendations
                  </h2>
                  <p className='text-violet-100 text-sm'>
                    Data-driven insights based on bid analysis
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {isInsightsLoading ? (
                  <div className='col-span-3 text-center py-8 text-white/80'>
                    Loading insights...
                  </div>
                ) : insights && insights.length > 0 ? (
                  insights.map((insight, index) => {
                    const getIcon = (variant: string) => {
                      switch (variant) {
                        case 'cost':
                          return Zap;
                        case 'delivery':
                          return Truck;
                        case 'compliance':
                          return ShieldCheck;
                        default:
                          return Zap;
                      }
                    };

                    return (
                      <AIInsightCard
                        key={index}
                        title={insight.title}
                        recommendation={insight.recommendation}
                        explanation={insight.explanation}
                        icon={getIcon(insight.variant)}
                        variant={insight.variant}
                        metrics={insight.metrics}
                      />
                    );
                  })
                ) : (
                  <div className='col-span-3 text-center py-4 text-white/80'>
                    No insights available for this RFP yet. Ensure quotations
                    have been submitted.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quotations Display */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-base font-semibold text-gray-900'>
                Submitted Quotations
              </h2>
              <p className='text-sm text-gray-500 mt-1'>
                Review and select vendors for each item
              </p>
            </div>

            <div className='divide-y divide-gray-100'>
              {quotations.map((quotation, index) => (
                <div key={quotation.id} className='p-6'>
                  {/* Quotation Header */}
                  <div
                    className='flex items-center justify-between cursor-pointer'
                    onClick={() => toggleQuotation(quotation.id!)}
                  >
                    <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Building2 size={14} className='text-violet-600' />
                        </div>
                        <div>
                          <p className='text-xs text-gray-500'>Supplier Name</p>
                          <p className='text-sm font-semibold text-gray-900'>
                            {quotation.supplierName}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Package size={16} className='text-gray-400' />
                        <div>
                          <p className='text-xs text-gray-500'>
                            Quotation Number
                          </p>
                          <p className='text-sm font-medium text-gray-700'>
                            {quotation.quotationNumber || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar size={16} className='text-gray-400' />
                        <div>
                          <p className='text-xs text-gray-500'>
                            Quotation Date
                          </p>
                          <p className='text-sm text-gray-600'>
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
                        <p className='text-sm font-bold text-violet-600'>
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
                    <div className='ml-4'>
                      {expandedQuotations.has(quotation.id!) ? (
                        <ChevronUp size={20} className='text-gray-400' />
                      ) : (
                        <ChevronDown size={20} className='text-gray-400' />
                      )}
                    </div>
                  </div>

                  {/* Quotation Items (Expandable) */}
                  {expandedQuotations.has(quotation.id!) && (
                    <div className='mt-6 border border-gray-200 rounded-lg overflow-hidden'>
                      <table className='min-w-full'>
                        <thead className='bg-[#fafbfc]'>
                          <tr>
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                              Item Name
                            </th>
                            <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                              Quantity
                            </th>
                            <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              Unit Price
                            </th>
                            <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              Total Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-100'>
                          {quotation.items && quotation.items.length > 0 ? (
                            quotation.items.map((item, itemIndex) => (
                              <tr key={itemIndex}>
                                <td className='px-4 py-3 text-sm text-gray-700'>
                                  {item.itemName}
                                </td>
                                <td className='px-4 py-3 text-center text-sm text-gray-600'>
                                  {item.quantity}
                                </td>
                                <td className='px-4 py-3 text-right text-sm text-gray-700'>
                                  ₹
                                  {item.unitPrice.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className='px-4 py-3 text-right text-sm font-medium text-gray-900'>
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
                                colSpan={4}
                                className='px-4 py-8 text-center text-sm text-gray-500'
                              >
                                No items available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Selection Section */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-base font-semibold text-gray-900 mb-1.5'>
                Finalize Vendor Selection
              </h2>
              <p className='text-sm text-gray-500 mb-6'>
                Select the winning vendor for each item
              </p>

              <div className='space-y-4'>
                {uniqueItemNames.map(itemName => {
                  // Get all quotations for this item
                  const itemQuotations = quotations
                    .map(q => ({
                      quotation: q,
                      item: q.items?.find(i => i.itemName === itemName),
                    }))
                    .filter(q => q.item !== undefined);

                  const firstItem = itemQuotations[0]?.item;
                  if (!firstItem) return null;

                  return (
                    <div
                      key={itemName}
                      className='border border-gray-200 rounded-lg p-4'
                    >
                      <h3 className='text-sm font-medium text-gray-900 mb-3'>
                        {itemName}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Select Vendor{' '}
                            <span className='text-red-500'>*</span>
                          </label>
                          <select
                            value={
                              vendorSelections[firstItem.id!]?.supplierId || ''
                            }
                            onChange={e => {
                              const supplierId = parseInt(e.target.value);
                              const supplier = quotations.find(
                                q => q.supplierId === supplierId
                              );
                              if (supplier) {
                                handleVendorSelection(
                                  firstItem.id!,
                                  supplierId,
                                  supplier.supplierName || ''
                                );
                              }
                            }}
                            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                          >
                            <option value=''>Select Vendor</option>
                            {itemQuotations.map(({ quotation, item }) => (
                              <option
                                key={quotation.supplierId}
                                value={quotation.supplierId}
                              >
                                {quotation.supplierName} - ₹
                                {item?.unitPrice.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Selection Remarks
                          </label>
                          <input
                            type='text'
                            value={
                              vendorSelections[firstItem.id!]?.remarks || ''
                            }
                            onChange={e =>
                              handleRemarksChange(firstItem.id!, e.target.value)
                            }
                            placeholder='Enter reason for selection...'
                            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Approval Details Section */}
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-base font-semibold text-gray-900 mb-5'>
                Approval Details
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Finalization Date
                  </label>
                  <input
                    type='date'
                    value={finalizationDate}
                    onChange={e => setFinalizationDate(e.target.value)}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <span className='text-red-500'>*</span> Approval Group
                  </label>
                  <select
                    value={approvalGroup}
                    onChange={e => setApprovalGroup(e.target.value)}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select Approval Group</option>
                    <option value='1'>Finance Team</option>
                    <option value='2'>Management</option>
                    <option value='3'>Board</option>
                  </select>
                </div>
              </div>

              {/* Bidding Questions */}
              <div className='mt-6 space-y-5'>
                <div>
                  <p className='text-sm font-medium text-gray-700 mb-3'>
                    Did you competitively bid the RFP with multiple suppliers?
                  </p>
                  <div className='flex items-center gap-6'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        checked={competitiveBidding}
                        onChange={() => setCompetitiveBidding(true)}
                        className='w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>Yes</span>
                    </label>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        checked={!competitiveBidding}
                        onChange={() => setCompetitiveBidding(false)}
                        className='w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className='text-sm font-medium text-gray-700 mb-3'>
                    Did you select the supplier with the lowest bid?
                  </p>
                  <div className='flex items-center gap-6'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        checked={lowestBidSelected}
                        onChange={() => {
                          setLowestBidSelected(true);
                          setShowJustification(false);
                        }}
                        className='w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>Yes</span>
                    </label>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        checked={!lowestBidSelected}
                        onChange={() => {
                          setLowestBidSelected(false);
                          setShowJustification(true);
                        }}
                        className='w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500'
                      />
                      <span className='ml-2 text-sm text-gray-700'>No</span>
                    </label>
                  </div>
                </div>

                {showJustification && (
                  <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                    <p className='text-sm font-medium text-amber-800 mb-3'>
                      Please provide justification for not selecting the lowest
                      bid:
                    </p>
                    <textarea
                      rows={3}
                      placeholder='Enter justification...'
                      className='w-full px-4 py-3 text-sm border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendForApprovalPage;
