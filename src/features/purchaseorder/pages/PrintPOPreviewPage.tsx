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
  AlertCircle
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
      const response = await apiClient.get(`/purchaseorder/${poId}/export/pdf`, {
        responseType: 'blob',
      });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading PO...</span>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading PO</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Purchase Order not found'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/purchase-orders/print')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const subTotal = po.subTotal || 0;
  const taxAmount = po.taxAmount || 0;
  const discountAmount = po.discountAmount || 0;
  const grandTotal = po.grandTotal || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar - Hidden when printing */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/purchase-orders/print')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Print Preview</h1>
              <p className="text-sm text-gray-600 mt-1">
                PO #{po.poNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-5xl mx-auto p-8 print:p-0">
        <div ref={printRef} className="bg-white shadow-lg print:shadow-none">
          {/* Company Header */}
          <div className="border-b-2 border-blue-600 p-8 print:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-blue-900">PURCHASE ORDER</h1>
                <p className="text-gray-600 mt-2">Autovitica P2P Procurement System</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">PO Number:</div>
                <div className="text-xl font-bold text-gray-900">{po.poNumber}</div>
                <div className="text-sm text-gray-600 mt-2">PO Date:</div>
                <div className="font-medium text-gray-900">{po.poDate ? formatDate(po.poDate) : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Supplier and Shipping Details */}
          <div className="grid grid-cols-2 gap-6 p-8 print:p-6 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Supplier Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{po.supplierName || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Shipping Address</h3>
              {po.shipToAddress ? (
                <div className="text-sm text-gray-600 whitespace-pre-line">{po.shipToAddress}</div>
              ) : (
                <div className="text-sm text-gray-500 italic">No shipping address provided</div>
              )}
            </div>
          </div>

          {/* PO Details */}
          <div className="grid grid-cols-3 gap-4 p-8 print:p-6 bg-gray-50 border-b border-gray-200">
            <div>
              <div className="text-xs text-gray-600 uppercase">Delivery Date</div>
              <div className="text-sm font-medium text-gray-900 mt-1">
                {po.deliveryDate ? formatDate(po.deliveryDate) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase">Raised By</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{po.raisedBy || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase">Department</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{po.department || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase">Payment Terms</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{po.paymentTerms || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase">Currency</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{po.currency || 'INR'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase">PO Type</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{po.poType || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8 print:p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {po.items && po.items.length > 0 ? (
                    po.items.map((item: any, index: number) => {
                      const itemTax = (item.tax1Value || 0) + (item.tax2Value || 0);
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.itemCode || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{item.unitOfMeasurement || 'PCS'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{item.unitPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{itemTax.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ₹{item.grandTotal?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Sub Total:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tax Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-sm font-medium text-gray-900">
                      -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg">
                  <span className="text-base font-semibold text-gray-900">Grand Total:</span>
                  <span className="text-base font-bold text-blue-600">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          {po.termsConditions && (
            <div className="p-8 print:p-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Terms & Conditions</h3>
              <div className="text-sm text-gray-600 whitespace-pre-line">{po.termsConditions}</div>
            </div>
          )}

          {/* Billing Address */}
          {po.billToAddress && (
            <div className="p-8 print:p-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Billing Address</h3>
              <div className="text-sm text-gray-600 whitespace-pre-line">{po.billToAddress}</div>
            </div>
          )}

          {/* Remarks */}
          {po.remarks && (
            <div className="p-8 print:p-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Remarks</h3>
              <div className="text-sm text-gray-600 whitespace-pre-line">{po.remarks}</div>
            </div>
          )}

          {/* Footer */}
          <div className="p-8 print:p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-xs text-gray-500">
              This is a computer-generated document. No signature is required.
            </div>
            <div className="text-center text-xs text-gray-500 mt-1">
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
