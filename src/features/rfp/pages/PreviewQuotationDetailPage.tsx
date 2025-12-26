/**
 * Preview Quotation Detail Page
 * Print-ready document view for quotation details
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';
import { useQuotationPreview } from '../hooks/usePreviewQuotation';

export const PreviewQuotationDetailPage: React.FC = () => {
  const { quotationId } = useParams<{ quotationId: string }>();
  const navigate = useNavigate();
  const quotationIdNum = quotationId ? parseInt(quotationId, 10) : 0;

  const {
    data: quotation,
    isLoading,
    error,
  } = useQuotationPreview(quotationIdNum);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gray-200 rounded-lg animate-pulse'></div>
              <div>
                <div className='w-40 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='w-28 h-4 bg-gray-200 rounded animate-pulse mt-1'></div>
              </div>
            </div>
            <div className='w-32 h-10 bg-gray-200 rounded-md animate-pulse'></div>
          </div>

          {/* Content Skeleton */}
          <div className='bg-white rounded-lg border border-gray-200 p-8 max-w-5xl mx-auto'>
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading quotation details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/quotation-preview')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Preview Quotation
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
                  Error Loading Quotation
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {error instanceof Error
                    ? error.message
                    : 'Quotation not found'}
                </p>
                <button
                  onClick={() => navigate('/rfp/quotation-preview')}
                  className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
                >
                  <ArrowLeft size={15} />
                  Return to Quotation List
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
      {/* Action Bar (Hidden during print) */}
      <div className='print:hidden p-6 pb-0'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp/quotation-preview')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Preview Quotation
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                {quotation.quotationNumber || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Printer size={15} />
            Print Quotation
          </button>
        </div>
      </div>

      {/* Print-Ready Document */}
      <div className='max-w-5xl mx-auto px-6 pb-6 print:p-0 print:max-w-none'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden print:border-0 print:rounded-none'>
          {/* Document Header */}
          <div className='p-8 print:p-12'>
            {/* Company Header */}
            <div className='border-b-2 border-violet-600 pb-6 mb-8'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-violet-600'>
                    AUTOVITICA P2P
                  </h1>
                  <p className='text-sm text-gray-500 mt-1'>
                    Procurement Management System
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Quotation Preview
                  </p>
                  <p className='text-lg font-bold text-gray-900'>
                    {quotation.quotationNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quotation Metadata */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
              <div>
                <h2 className='text-base font-semibold text-gray-900 mb-4'>
                  Quotation Information
                </h2>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Quotation Number
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {quotation.quotationNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Calendar size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Quotation Date
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {quotation.quotationDate
                          ? new Date(
                              quotation.quotationDate
                            ).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Payment Terms
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {quotation.paymentTerms || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className='text-base font-semibold text-gray-900 mb-4'>
                  Supplier Details
                </h2>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Building2 size={14} className='text-violet-600' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Supplier Name
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {quotation.supplierName || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Status
                      </p>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 mt-0.5'>
                        {quotation.status || 'NEGOTIATION'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Negotiation Notes (if any) */}
            {quotation.negotiationNotes && (
              <div className='mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
                <h3 className='text-sm font-semibold text-amber-800 mb-1'>
                  Negotiation Notes
                </h3>
                <p className='text-sm text-amber-700'>
                  {quotation.negotiationNotes}
                </p>
              </div>
            )}

            {/* Item Details Table */}
            <div className='mb-8'>
              <h2 className='text-base font-semibold text-gray-900 mb-4'>
                Item Details
              </h2>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-16'>
                        S.No
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Item Name
                      </th>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Quantity
                      </th>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        UOM
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Tax %
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Tax Amount
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {quotation.items && quotation.items.length > 0 ? (
                      quotation.items.map((item, index) => (
                        <tr
                          key={index}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-center'>
                            {index + 1}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-700'>
                            {item.itemName}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-center'>
                            {item.quantity}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-center'>
                            {item.unitOfMeasurement || 'N/A'}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-700 text-right'>
                            ₹
                            {item.unitPrice.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-center'>
                            {item.taxRate || 0}%
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-700 text-right'>
                            ₹
                            {(item.taxAmount || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className='px-4 py-3.5 text-sm font-medium text-gray-900 text-right'>
                            ₹
                            {(item.totalPrice || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-4 py-8 text-center text-sm text-gray-400'
                        >
                          No items available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grand Total Section */}
            <div className='flex justify-end'>
              <div className='w-80 bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Subtotal</span>
                    <span className='font-medium text-gray-900'>
                      ₹
                      {(
                        (quotation.totalAmount || 0) -
                        (quotation.taxAmount || 0)
                      ).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Tax Amount</span>
                    <span className='font-medium text-gray-900'>
                      ₹
                      {(quotation.taxAmount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Other Charges</span>
                    <span className='font-medium text-gray-900'>
                      ₹
                      {(quotation.otherCharges || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className='border-t-2 border-violet-600 pt-3 mt-3'>
                    <div className='flex justify-between'>
                      <span className='text-base font-bold text-gray-900'>
                        Grand Total
                      </span>
                      <span className='text-lg font-bold text-violet-600'>
                        ₹
                        {(
                          quotation.netAmount ||
                          quotation.totalAmount ||
                          0
                        ).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='mt-12 pt-6 border-t border-gray-200 text-center'>
              <p className='text-xs text-gray-400'>
                This is a system-generated quotation preview document from
                Autovitica P2P
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Printed on:{' '}
                {new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          @page {
            margin: 0.5in;
            size: A4;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:max-w-none {
            max-width: none !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:rounded-none {
            border-radius: 0 !important;
          }

          .print\\:p-12 {
            padding: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewQuotationDetailPage;
