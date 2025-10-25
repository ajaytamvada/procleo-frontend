/**
 * Preview Quotation List Page
 * Shows list of negotiated quotations ready for preview and printing
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  Eye,
  Calendar,
  User,
  Package,
  AlertCircle,
  Printer
} from 'lucide-react';
import { useNegotiatedQuotations } from '../hooks/usePreviewQuotation';

export const PreviewQuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch RFPs with negotiated quotations
  const { data: rfps = [], isLoading, error } = useNegotiatedQuotations();

  // Flatten RFPs to get list of negotiated quotations
  const negotiatedQuotations = rfps.flatMap((rfp) =>
    (rfp.quotations || [])
      .filter((q) => q.status === 'NEGOTIATION')
      .map((quotation) => ({
        ...quotation,
        rfpNumber: rfp.rfpNumber,
        rfpDate: rfp.requestDate,
        department: rfp.department,
        requestedBy: rfp.requestedBy,
      }))
  );

  // Filter quotations based on search term
  const filteredQuotations = negotiatedQuotations.filter(
    (q) =>
      !searchTerm ||
      q.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = (quotationId: number) => {
    navigate(`/rfp/quotation-preview/${quotationId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading quotations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Quotations</h3>
            <p className="text-red-600 text-sm mt-1">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview Quotation</h1>
            <p className="text-sm text-gray-600">Review and print negotiated quotations</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by RFP number, supplier, or quotation number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Quotations List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredQuotations.length === 0 ? (
            <div className="p-8 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchTerm ? 'No matching quotations found' : 'No quotations available for preview'}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Negotiated quotations will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFP Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package size={16} className="text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-purple-600">
                            {quotation.rfpNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {quotation.supplierName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {quotation.quotationNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {quotation.quotationDate
                              ? new Date(quotation.quotationDate).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">
                          ₹{(quotation.netAmount || quotation.totalAmount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handlePreview(quotation.id!)}
                          className="inline-flex items-center px-3 py-1.5 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                          <Eye size={14} className="mr-1.5" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredQuotations.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2 text-purple-600">
              <Printer size={16} />
              <span>Click Preview to print quotation documents</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewQuotationListPage;
