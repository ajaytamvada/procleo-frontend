/**
 * RFP Summary Detail Page
 * Comprehensive print-ready RFP summary document
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2, AlertCircle } from 'lucide-react';
import { useRFPSummary } from '../hooks/useRFPSummary';

export const RFPSummaryDetailPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const { data: summary, isLoading, error } = useRFPSummary(Number(rfpId));

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
        <span className='ml-2 text-gray-600'>Loading RFP summary...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>
              Error Loading RFP Summary
            </h3>
            <p className='text-red-600 text-sm mt-1'>
              {error instanceof Error
                ? error.message
                : 'Unable to load RFP summary'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header - Hidden on print */}
      <div className='bg-white border-b border-gray-200 px-6 py-4 print:hidden'>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => navigate('/rfp/summary')}
            className='flex items-center text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft size={20} className='mr-2' />
            Back to List
          </button>
          <button
            onClick={handlePrint}
            className='inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
          >
            <Printer size={18} className='mr-2' />
            Print Summary
          </button>
        </div>
      </div>

      {/* Print-ready summary document */}
      <div className='max-w-6xl mx-auto p-6 print:p-0'>
        <div className='bg-white shadow-sm rounded-lg p-8 print:shadow-none'>
          {/* Summary Header */}
          <div className='border-b-2 border-gray-300 pb-4 mb-6'>
            <h1 className='text-3xl font-bold text-gray-900 text-center'>
              RFP SUMMARY
            </h1>
          </div>

          {/* RFP Details */}
          <div className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
              RFP DETAILS
            </h2>
            <div className='grid grid-cols-2 gap-4 px-4'>
              <div>
                <p className='text-sm text-gray-600'>RFP Number</p>
                <p className='font-semibold'>{summary.rfpNumber}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>RFP Date</p>
                <p className='font-semibold'>
                  {new Date(summary.rfpDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Requested By</p>
                <p className='font-semibold'>{summary.requestedBy || 'N/A'}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Department</p>
                <p className='font-semibold'>{summary.department || 'N/A'}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Status</p>
                <p className='font-semibold'>{summary.status}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Priority</p>
                <p className='font-semibold'>{summary.priority || 'Normal'}</p>
              </div>
            </div>
            {summary.description && (
              <div className='px-4 mt-4'>
                <p className='text-sm text-gray-600'>Description</p>
                <p className='mt-1'>{summary.description}</p>
              </div>
            )}
          </div>

          {/* Items Requested */}
          {summary.items && summary.items.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
                ITEMS REQUESTED
              </h2>
              <div className='overflow-x-auto px-4'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Name
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Code
                      </th>
                      <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
                        Quantity
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        UOM
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {summary.items.map((item, index) => (
                      <tr key={index}>
                        <td className='px-4 py-2 text-sm'>{item.itemName}</td>
                        <td className='px-4 py-2 text-sm'>{item.itemCode}</td>
                        <td className='px-4 py-2 text-sm text-center'>
                          {item.quantity}
                        </td>
                        <td className='px-4 py-2 text-sm'>
                          {item.unitOfMeasurement}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vendors Sent To */}
          {summary.suppliers && summary.suppliers.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
                VENDORS SENT TO
              </h2>
              <div className='px-4'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {summary.suppliers.map((supplier, index) => (
                      <tr key={index}>
                        <td className='px-4 py-2 text-sm'>
                          {supplier.supplierName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comparative Statement */}
          {summary.quotations && summary.quotations.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
                COMPARATIVE STATEMENT
              </h2>
              {summary.quotations.map((quotation, qIndex) => (
                <div key={qIndex} className='mb-6 px-4'>
                  <div className='bg-blue-50 p-3 rounded mb-2'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <span className='font-semibold'>Vendor:</span>{' '}
                        {quotation.supplierName}
                      </div>
                      <div>
                        <span className='font-semibold'>Vendor Code:</span>{' '}
                        {quotation.supplierCode}
                      </div>
                      <div>
                        <span className='font-semibold'>Quotation No:</span>{' '}
                        {quotation.quotationNumber}
                      </div>
                      <div>
                        <span className='font-semibold'>Quotation Date:</span>{' '}
                        {quotation.quotationDate
                          ? new Date(
                              quotation.quotationDate
                            ).toLocaleDateString()
                          : '-'}
                      </div>
                    </div>
                  </div>
                  <table className='min-w-full divide-y divide-gray-200 mb-2'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-2 py-2 text-left text-xs font-medium text-gray-500'>
                          Item
                        </th>
                        <th className='px-2 py-2 text-center text-xs font-medium text-gray-500'>
                          Qty
                        </th>
                        <th className='px-2 py-2 text-right text-xs font-medium text-gray-500'>
                          Unit Price
                        </th>
                        <th className='px-2 py-2 text-right text-xs font-medium text-gray-500'>
                          Tax
                        </th>
                        <th className='px-2 py-2 text-right text-xs font-medium text-gray-500'>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {(quotation.items || []).map((item, iIndex) => (
                        <tr key={iIndex}>
                          <td className='px-2 py-2 text-sm'>{item.itemName}</td>
                          <td className='px-2 py-2 text-sm text-center'>
                            {item.quantity}
                          </td>
                          <td className='px-2 py-2 text-sm text-right'>
                            ₹{item.unitPrice?.toFixed(2)}
                          </td>
                          <td className='px-2 py-2 text-sm text-right'>
                            ₹{item.taxAmount?.toFixed(2)}
                          </td>
                          <td className='px-2 py-2 text-sm text-right font-semibold'>
                            ₹{item.totalPrice?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className='bg-gray-50 p-2 rounded'>
                    <div className='flex justify-end space-x-8 text-sm'>
                      <div>
                        <span className='text-gray-600'>Other Charges:</span>{' '}
                        <span className='font-semibold'>
                          ₹{quotation.otherCharges?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Discount:</span>{' '}
                        <span className='font-semibold'>
                          ₹{quotation.discountAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600 font-bold'>
                          Grand Total:
                        </span>{' '}
                        <span className='font-bold text-lg'>
                          ₹{quotation.grandTotal?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selection Basis (L1, L2, etc.) */}
          {summary.bidEvaluations && summary.bidEvaluations.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
                SELECTION BASIS
              </h2>
              <div className='px-4'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        Vendor Name
                      </th>
                      <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase'>
                        Total Bid Amount
                      </th>
                      <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
                        Rank
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {summary.bidEvaluations.map((evaluation, index) => (
                      <tr
                        key={index}
                        className={
                          evaluation.lowestBidRank === 1 ? 'bg-green-50' : ''
                        }
                      >
                        <td className='px-4 py-2 text-sm font-semibold'>
                          {evaluation.supplierName}
                        </td>
                        <td className='px-4 py-2 text-sm text-right'>
                          ₹{evaluation.totalBidAmount?.toFixed(2)}
                        </td>
                        <td className='px-4 py-2 text-sm text-center font-bold'>
                          L{evaluation.lowestBidRank}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Negotiation History */}
          {summary.negotiations && summary.negotiations.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
                NEGOTIATION HISTORY
              </h2>
              <div className='overflow-x-auto px-4'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-2 py-2 text-left text-xs font-medium text-gray-500'>
                        Vendor
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium text-gray-500'>
                        Item
                      </th>
                      <th className='px-2 py-2 text-right text-xs font-medium text-gray-500'>
                        Old Price
                      </th>
                      <th className='px-2 py-2 text-right text-xs font-medium text-gray-500'>
                        New Price
                      </th>
                      <th className='px-2 py-2 text-left text-xs font-medium text-gray-500'>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {summary.negotiations.map((nego, index) => (
                      <tr key={index}>
                        <td className='px-2 py-2 text-sm'>
                          {nego.supplierName}
                        </td>
                        <td className='px-2 py-2 text-sm'>{nego.itemName}</td>
                        <td className='px-2 py-2 text-sm text-right'>
                          ₹{nego.oldTotalPrice?.toFixed(2)}
                        </td>
                        <td className='px-2 py-2 text-sm text-right font-semibold text-green-600'>
                          ₹{nego.newTotalPrice?.toFixed(2)}
                        </td>
                        <td className='px-2 py-2 text-sm'>
                          {nego.negotiationNotes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Selected Vendors */}
          {summary.selectedVendors && summary.selectedVendors.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 bg-gray-100 px-4 py-2'>
                SELECTED VENDORS
              </h2>
              <div className='px-4'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        Vendor Name
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Name
                      </th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {summary.selectedVendors.map((vendor, index) => (
                      <tr key={index} className='bg-green-50'>
                        <td className='px-4 py-2 text-sm font-semibold'>
                          {vendor.supplierName}
                        </td>
                        <td className='px-4 py-2 text-sm'>{vendor.itemName}</td>
                        <td className='px-4 py-2 text-sm'>
                          {vendor.selectionRemarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600 print:block'>
            <p>
              This is a computer-generated document. Printed on{' '}
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default RFPSummaryDetailPage;
