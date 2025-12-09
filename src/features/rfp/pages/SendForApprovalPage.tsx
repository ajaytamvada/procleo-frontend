/**
 * Send For Approval Page
 * Allows finalization of vendor selection and sending RFP for management approval
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRFPForComparison } from '../hooks/useNegotiateQuotation';
import { useSendForApproval } from '../hooks/useSendForApproval';

export const SendForApprovalPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;

  const { data: rfp, isLoading, error } = useRFPForComparison(rfpIdNum);
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
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
        <span className='ml-2 text-gray-600'>Loading RFP details...</span>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>Error Loading RFP</h3>
            <p className='text-red-600 text-sm mt-1'>
              {error instanceof Error ? error.message : 'RFP not found'}
            </p>
            <button
              onClick={() => navigate('/rfp/send-for-approval')}
              className='mt-3 text-sm text-red-700 hover:text-red-800 underline'
            >
              Return to RFP List
            </button>
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
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => navigate('/rfp/send-for-approval')}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Send For Approval
              </h1>
              <p className='text-sm text-gray-600'>{rfp.rfpNumber}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={sendForApprovalMutation.isPending}
            className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
          >
            {sendForApprovalMutation.isPending ? (
              <Loader2 size={16} className='animate-spin' />
            ) : (
              <Check size={16} />
            )}
            <span>Send For Approval</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='max-w-7xl mx-auto space-y-6'>
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
                  Closing Date
                </p>
                <p className='mt-1 text-sm text-gray-900'>
                  {new Date(rfp.closingDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase'>
                  Quotations Received
                </p>
                <p className='mt-1 text-sm font-semibold text-green-600'>
                  {quotations.length}
                </p>
              </div>
            </div>
          </div>

          {/* Quotations Display */}
          <div className='bg-white rounded-lg border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Submitted Quotations
              </h2>
              <p className='text-sm text-gray-600 mt-1'>
                Review and select vendors for each item
              </p>
            </div>

            <div className='divide-y divide-gray-200'>
              {quotations.map((quotation, index) => (
                <div key={quotation.id} className='p-6'>
                  {/* Quotation Header */}
                  <div
                    className='flex items-center justify-between cursor-pointer'
                    onClick={() => toggleQuotation(quotation.id!)}
                  >
                    <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-4'>
                      <div className='flex items-center'>
                        <Building2 size={16} className='text-gray-400 mr-2' />
                        <div>
                          <p className='text-xs text-gray-500'>Supplier Name</p>
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
                        <p className='text-sm font-bold text-purple-600'>
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
                    <div className='mt-4 overflow-x-auto'>
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
                                colSpan={4}
                                className='px-4 py-4 text-center text-sm text-gray-500'
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
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Finalize Vendor Selection
            </h2>
            <p className='text-sm text-gray-600 mb-6'>
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
                    <h3 className='font-medium text-gray-900 mb-3'>
                      {itemName}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Select Vendor <span className='text-red-600'>*</span>
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
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
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Selection Remarks
                        </label>
                        <input
                          type='text'
                          value={vendorSelections[firstItem.id!]?.remarks || ''}
                          onChange={e =>
                            handleRemarksChange(firstItem.id!, e.target.value)
                          }
                          placeholder='Enter reason for selection...'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Approval Details Section */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Approval Details
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Finalization Date <span className='text-red-600'>*</span>
                </label>
                <input
                  type='date'
                  value={finalizationDate}
                  onChange={e => setFinalizationDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Approval Group <span className='text-red-600'>*</span>
                </label>
                <select
                  value={approvalGroup}
                  onChange={e => setApprovalGroup(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option value=''>Select Approval Group</option>
                  <option value='1'>Finance Team</option>
                  <option value='2'>Management</option>
                  <option value='3'>Board</option>
                </select>
              </div>
            </div>

            {/* Bidding Questions */}
            <div className='mt-6 space-y-4'>
              <div>
                <p className='text-sm font-medium text-gray-700 mb-2'>
                  Did you competitively bid the RFP with multiple suppliers?
                </p>
                <div className='flex items-center space-x-4'>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={competitiveBidding}
                      onChange={() => setCompetitiveBidding(true)}
                      className='mr-2'
                    />
                    <span className='text-sm text-gray-700'>Yes</span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={!competitiveBidding}
                      onChange={() => setCompetitiveBidding(false)}
                      className='mr-2'
                    />
                    <span className='text-sm text-gray-700'>No</span>
                  </label>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700 mb-2'>
                  Did you select the supplier with the lowest bid?
                </p>
                <div className='flex items-center space-x-4'>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={lowestBidSelected}
                      onChange={() => {
                        setLowestBidSelected(true);
                        setShowJustification(false);
                      }}
                      className='mr-2'
                    />
                    <span className='text-sm text-gray-700'>Yes</span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={!lowestBidSelected}
                      onChange={() => {
                        setLowestBidSelected(false);
                        setShowJustification(true);
                      }}
                      className='mr-2'
                    />
                    <span className='text-sm text-gray-700'>No</span>
                  </label>
                </div>
              </div>

              {showJustification && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <p className='text-sm font-medium text-yellow-800 mb-3'>
                    Please provide justification for not selecting the lowest
                    bid:
                  </p>
                  <textarea
                    rows={3}
                    placeholder='Enter justification...'
                    className='w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendForApprovalPage;
