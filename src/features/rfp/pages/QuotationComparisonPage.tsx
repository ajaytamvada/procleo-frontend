/**
 * Quotation Comparison Page
 * Displays all quotations for an RFP side-by-side for comparison and negotiation
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Loader2, AlertCircle, Building2, Calendar, Package } from 'lucide-react';
import { useRFPForComparison, useNegotiateQuotation } from '../hooks/useNegotiateQuotation';

export const QuotationComparisonPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const navigate = useNavigate();
  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;

  const { data: rfp, isLoading, error } = useRFPForComparison(rfpIdNum);
  const negotiateMutation = useNegotiateQuotation();

  const [negotiationNotes, setNegotiationNotes] = useState<{ [key: number]: string }>({});

  const handleNegotiate = (quotationId: number) => {
    negotiateMutation.mutate({
      quotationId,
      negotiationNotes: negotiationNotes[quotationId] || 'Request for better pricing'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading quotation comparison...</span>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Quotations</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Quotations not found'}
            </p>
            <button
              onClick={() => navigate('/rfp/negotiate')}
              className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
            >
              Return to RFP List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group quotations by supplier
  const quotations = rfp.quotations || [];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/rfp/negotiate')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotation Comparison</h1>
              <p className="text-sm text-gray-600">{rfp.rfpNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* RFP Info */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">RFP Number</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{rfp.rfpNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Request Date</p>
            <p className="mt-1 text-sm text-gray-900">{new Date(rfp.requestDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Closing Date</p>
            <p className="mt-1 text-sm text-gray-900">{new Date(rfp.closingDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Quotations</p>
            <p className="mt-1 text-sm font-semibold text-green-600">{quotations.length} Received</p>
          </div>
        </div>
      </div>

      {/* Quotations List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {quotations.map((quotation, index) => (
            <div key={quotation.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Quotation Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <Building2 size={16} className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Supplier Name</p>
                          <p className="text-sm font-semibold text-gray-900">{quotation.supplierName}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Package size={16} className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Quotation Number</p>
                          <p className="text-sm font-semibold text-gray-900">{quotation.quotationNumber || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Quotation Date</p>
                          <p className="text-sm text-gray-900">
                            {quotation.quotationDate ? new Date(quotation.quotationDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Payment Terms</p>
                        <p className="text-sm text-gray-900">{quotation.paymentTerms || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quotation.status === 'SUBMITTED'
                            ? 'bg-green-100 text-green-800'
                            : quotation.status === 'NEGOTIATION'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {quotation.status || 'SUBMITTED'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-sm font-bold text-purple-600">
                          ₹{(quotation.netAmount || quotation.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quotation Items */}
              <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Item Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Tax %</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax Amount</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotation.items && quotation.items.length > 0 ? (
                        quotation.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 text-center text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900">
                              ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-600">{item.taxRate || 0}%</td>
                            <td className="px-4 py-2 text-right text-sm text-gray-900">
                              ₹{(item.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                              ₹{(item.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                            No items available
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                          Grand Total:
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-purple-600">
                          ₹{(quotation.netAmount || quotation.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Negotiate Section */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-end justify-between">
                  <div className="flex-1 mr-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Negotiation Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={negotiationNotes[quotation.id!] || ''}
                      onChange={(e) => setNegotiationNotes({ ...negotiationNotes, [quotation.id!]: e.target.value })}
                      placeholder="Enter reason for negotiation..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => handleNegotiate(quotation.id!)}
                    disabled={negotiateMutation.isPending || quotation.status === 'NEGOTIATION'}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare size={16} />
                    <span>{quotation.status === 'NEGOTIATION' ? 'Negotiated' : 'Negotiate'}</span>
                  </button>
                </div>
                {quotation.negotiationNotes && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-medium text-yellow-800">Previous Negotiation Notes:</p>
                    <p className="text-sm text-yellow-700 mt-1">{quotation.negotiationNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuotationComparisonPage;
