/**
 * Preview Quotation Detail Page
 * Print-ready document view for quotation details
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2, AlertCircle, Building2, Calendar, FileText } from 'lucide-react';
import { useQuotationPreview } from '../hooks/usePreviewQuotation';

export const PreviewQuotationDetailPage: React.FC = () => {
  const { quotationId } = useParams<{ quotationId: string }>();
  const navigate = useNavigate();
  const quotationIdNum = quotationId ? parseInt(quotationId, 10) : 0;

  const { data: quotation, isLoading, error } = useQuotationPreview(quotationIdNum);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading quotation details...</span>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Quotation</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Quotation not found'}
            </p>
            <button
              onClick={() => navigate('/rfp/quotation-preview')}
              className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
            >
              Return to Quotation List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar (Hidden during print) */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/rfp/quotation-preview')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to List</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Printer size={20} />
            <span>Print Quotation</span>
          </button>
        </div>
      </div>

      {/* Print-Ready Document */}
      <div className="max-w-5xl mx-auto p-8 print:p-0">
        <div className="bg-white rounded-lg shadow-lg print:shadow-none p-8 print:p-12">
          {/* Company Header */}
          <div className="border-b-2 border-purple-600 pb-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-purple-600">AUTOVITICA P2P</h1>
                <p className="text-sm text-gray-600 mt-1">Procurement Management System</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-semibold">Quotation Preview</div>
                <div className="text-lg font-bold text-gray-900 mt-1">
                  {quotation.quotationNumber || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Metadata */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quotation Information</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <FileText size={16} className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Quotation Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quotation.quotationNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar size={16} className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Quotation Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quotation.quotationDate
                        ? new Date(quotation.quotationDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText size={16} className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Payment Terms</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quotation.paymentTerms || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Details</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Building2 size={16} className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Supplier Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {quotation.supplierName || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText size={16} className="text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {quotation.status || 'NEGOTIATION'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Negotiation Notes (if any) */}
          {quotation.negotiationNotes && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Negotiation Notes</h3>
              <p className="text-sm text-yellow-700">{quotation.negotiationNotes}</p>
            </div>
          )}

          {/* Item Details Table */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UOM
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax %
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotation.items && quotation.items.length > 0 ? (
                    quotation.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {item.unitOfMeasurement || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {item.taxRate || 0}%
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          ₹{(item.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          ₹{(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        No items available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Section */}
          <div className="flex justify-end">
            <div className="w-96 border-t-2 border-gray-300 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ₹{((quotation.totalAmount || 0) - (quotation.taxAmount || 0)).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax Amount:</span>
                  <span className="font-medium text-gray-900">
                    ₹{(quotation.taxAmount || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Charges:</span>
                  <span className="font-medium text-gray-900">
                    ₹{(0 || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="border-t-2 border-purple-600 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Grand Total:</span>
                    <span className="font-bold text-purple-600">
                      ₹{(quotation.netAmount || quotation.totalAmount || 0).toLocaleString('en-IN', {
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
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>This is a system-generated quotation preview document from Autovitica P2P</p>
            <p className="mt-1">Printed on: {new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            margin: 0.5in;
            size: A4;
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

          .print\\:p-12 {
            padding: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewQuotationDetailPage;
