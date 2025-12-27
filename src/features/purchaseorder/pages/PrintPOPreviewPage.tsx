/**
 * Print PO Preview Page
 * Displays PO in a printable format with company letterhead
 */

import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { usePurchaseOrder } from '../hooks/usePurchaseOrders';
import { format, parseISO } from 'date-fns';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export const PrintPOPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const poId = id ? parseInt(id, 10) : 0;
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const { data: po, isLoading, error } = usePurchaseOrder(poId);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!po) return;

    try {
      setIsDownloading(true);
      const response = await apiClient.get(
        `/purchaseorder/${poId}/export/pdf`,
        {
          responseType: 'blob',
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO_${po.poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    navigate('/purchase-orders/print');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='flex flex-col items-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            <p className='text-sm text-gray-500 mt-3'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-6'>
        <div className='mb-6'>
          <h1 className='text-xl font-semibold text-gray-900'>PO Preview</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Preview and print purchase orders
          </p>
        </div>
        <div className='bg-white rounded-lg border border-gray-200 py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertCircle className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>Error Loading PO</p>
            <p className='text-gray-400 text-sm mt-1'>
              {error instanceof Error
                ? error.message
                : 'Purchase Order not found'}
            </p>
            <button
              onClick={handleBack}
              className='mt-4 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subTotal = po.subTotal || 0;
  const taxAmount = po.taxAmount || 0;
  const discountAmount = po.discountAmount || 0;
  const grandTotal = po.grandTotal || 0;

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6 print:hidden'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={handleBack}
            className='text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ArrowLeft className='h-6 w-6' />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>PO Preview</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Preview and print purchase orders
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={handlePrint}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Printer className='h-4 w-4' />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDownloading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className='max-w-5xl mx-auto p-8 print:p-0'>
        <div ref={printRef} className='bg-white shadow-lg print:shadow-none'>
          {/* Company Header */}
          <div className='border-b-2 border-blue-600 p-8 print:p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-3xl font-bold text-blue-900'>
                  PURCHASE ORDER
                </h1>
                <p className='text-gray-600 mt-2'>
                  Autovitica P2P Procurement System
                </p>
              </div>
              <div className='text-right'>
                <div className='text-sm text-gray-600'>PO Number:</div>
                <div className='text-xl font-bold text-gray-900'>
                  {po.poNumber}
                </div>
                <div className='text-sm text-gray-600 mt-2'>PO Date:</div>
                <div className='font-medium text-gray-900'>
                  {po.poDate ? formatDate(po.poDate) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Supplier and Shipping Details */}
          <div className='grid grid-cols-2 gap-6 p-8 print:p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-sm font-semibold text-gray-700 uppercase mb-3'>
                Supplier Details
              </h3>
              <div className='space-y-2'>
                <div>
                  <span className='text-sm font-medium text-gray-900'>
                    {po.supplierName || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-sm font-semibold text-gray-700 uppercase mb-3'>
                Shipping Address
              </h3>
              {po.shipToAddress ? (
                <div className='text-sm text-gray-600 whitespace-pre-line'>
                  {po.shipToAddress}
                </div>
              ) : (
                <div className='text-sm text-gray-500 italic'>
                  No shipping address provided
                </div>
              )}
            </div>
          </div>

          {/* PO Details */}
          <div className='grid grid-cols-3 gap-4 p-8 print:p-6 bg-gray-50 border-b border-gray-200'>
            <div>
              <div className='text-xs text-gray-600 uppercase'>
                Delivery Date
              </div>
              <div className='text-sm font-medium text-gray-900 mt-1'>
                {po.deliveryDate ? formatDate(po.deliveryDate) : 'N/A'}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-600 uppercase'>Raised By</div>
              <div className='text-sm font-medium text-gray-900 mt-1'>
                {po.raisedBy || 'N/A'}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-600 uppercase'>Department</div>
              <div className='text-sm font-medium text-gray-900 mt-1'>
                {po.department || 'N/A'}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-600 uppercase'>
                Payment Terms
              </div>
              <div className='text-sm font-medium text-gray-900 mt-1'>
                {po.paymentTerms || 'N/A'}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-600 uppercase'>Currency</div>
              <div className='text-sm font-medium text-gray-900 mt-1'>
                {po.currency || 'INR'}
              </div>
            </div>
            <div>
              <div className='text-xs text-gray-600 uppercase'>PO Type</div>
              <div className='text-sm font-medium text-gray-900 mt-1'>
                {po.poType || 'N/A'}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className='p-8 print:p-6'>
            <h3 className='text-sm font-semibold text-gray-700 uppercase mb-4'>
              Order Items
            </h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full'>
                <thead>
                  <tr className='bg-[#fafbfc]'>
                    <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide w-16'>
                      SL No.
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                      Item Name
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                      Item Code
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                      Quantity
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                      UOM
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                      Unit Price
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                      Tax
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {po.items && po.items.length > 0 ? (
                    po.items.map((item: any, index: number) => {
                      const itemTax =
                        (item.tax1Value || 0) + (item.tax2Value || 0);
                      return (
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
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {item.itemCode || '-'}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-right'>
                            {item.quantity}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {item.unitOfMeasurement || 'PCS'}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-right'>
                            ₹{item.unitPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600 text-right'>
                            ₹{itemTax.toFixed(2)}
                          </td>
                          <td className='px-4 py-3.5 text-sm font-medium text-gray-900 text-right'>
                            ₹{item.grandTotal?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className='px-4 py-8 text-center text-gray-500'
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className='mt-6 flex justify-end'>
              <div className='w-80 space-y-2'>
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-sm text-gray-600'>Sub Total:</span>
                  <span className='text-sm font-medium text-gray-900'>
                    ₹
                    {subTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='flex justify-between py-2 border-b border-gray-200'>
                  <span className='text-sm text-gray-600'>Tax Amount:</span>
                  <span className='text-sm font-medium text-gray-900'>
                    ₹
                    {taxAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className='flex justify-between py-2 border-b border-gray-200'>
                    <span className='text-sm text-gray-600'>Discount:</span>
                    <span className='text-sm font-medium text-gray-900'>
                      -₹
                      {discountAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className='flex justify-between py-3 bg-blue-50 px-4 rounded-lg'>
                  <span className='text-base font-semibold text-gray-900'>
                    Grand Total:
                  </span>
                  <span className='text-base font-bold text-blue-600'>
                    ₹
                    {grandTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          {po.termsConditions && (
            <div className='p-8 print:p-6 border-t border-gray-200'>
              <h3 className='text-sm font-semibold text-gray-700 uppercase mb-3'>
                Terms & Conditions
              </h3>
              <div className='text-sm text-gray-600 whitespace-pre-line'>
                {po.termsConditions}
              </div>
            </div>
          )}

          {/* Billing Address */}
          {po.billToAddress && (
            <div className='p-8 print:p-6 border-t border-gray-200'>
              <h3 className='text-sm font-semibold text-gray-700 uppercase mb-3'>
                Billing Address
              </h3>
              <div className='text-sm text-gray-600 whitespace-pre-line'>
                {po.billToAddress}
              </div>
            </div>
          )}

          {/* Remarks */}
          {po.remarks && (
            <div className='p-8 print:p-6 border-t border-gray-200'>
              <h3 className='text-sm font-semibold text-gray-700 uppercase mb-3'>
                Remarks
              </h3>
              <div className='text-sm text-gray-600 whitespace-pre-line'>
                {po.remarks}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='p-8 print:p-6 border-t border-gray-200 bg-gray-50'>
            <div className='text-center text-xs text-gray-500'>
              This is a computer-generated document. No signature is required.
            </div>
            <div className='text-center text-xs text-gray-500 mt-1'>
              Generated on {format(new Date(), 'dd MMM yyyy HH:mm')}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:shadow-none {
            box-shadow: none !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:p-6 {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintPOPreviewPage;
