/**
 * Preview Quotation List Page
 * Shows list of negotiated quotations ready for preview and printing
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Printer,
} from 'lucide-react';
import { useNegotiatedQuotations } from '../hooks/usePreviewQuotation';

export const PreviewQuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch RFPs with negotiated quotations
  const {
    data: rfps = [],
    isLoading,
    error,
    refetch,
  } = useNegotiatedQuotations();

  // Flatten RFPs to get list of negotiated quotations
  const negotiatedQuotations = rfps.flatMap(rfp =>
    (rfp.quotations || [])
      .filter(q => q.status === 'NEGOTIATION')
      .map(quotation => ({
        ...quotation,
        rfpNumber: rfp.rfpNumber,
        rfpDate: rfp.requestDate,
        department: rfp.department,
        requestedBy: rfp.requestedBy,
      }))
  );

  // Filter quotations based on search term
  const filteredQuotations = negotiatedQuotations.filter(
    q =>
      !searchTerm ||
      q.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePreview = (quotationId: number) => {
    navigate(`/rfp/quotation-preview/${quotationId}`);
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Preview Quotation
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Review and print negotiated quotations
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by RFP number, supplier, or quotation number...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <button
            onClick={() => refetch()}
            className='inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors'
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
            <AlertCircle className='w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0' />
            <div>
              <p className='text-sm font-medium text-red-800'>
                Error Loading Quotations
              </p>
              <p className='text-sm text-red-600 mt-0.5'>
                {error instanceof Error
                  ? error.message
                  : 'Unknown error occurred'}
              </p>
            </div>
          </div>
        )}

        {/* Quotations Table Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    RFP Number
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Supplier Name
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Quotation Number
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Quotation Date
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Total Amount
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                        <p className='text-sm text-gray-500 mt-3'>
                          Loading quotations...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                          <FileText className='w-6 h-6 text-gray-400' />
                        </div>
                        <p className='text-gray-600 font-medium'>
                          {searchTerm
                            ? 'No matching quotations found'
                            : 'No quotations available for preview'}
                        </p>
                        <p className='text-gray-400 text-sm mt-1'>
                          {searchTerm
                            ? 'Try adjusting your search criteria'
                            : 'Negotiated quotations will appear here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotations.map(quotation => (
                    <tr
                      key={quotation.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <span className='text-sm font-medium text-violet-600'>
                          {quotation.rfpNumber}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Building2 size={14} className='text-violet-600' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {quotation.supplierName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>
                        {quotation.quotationNumber || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {quotation.quotationDate
                          ? new Date(
                              quotation.quotationDate
                            ).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <span className='text-sm font-semibold text-green-600'>
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
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => handlePreview(quotation.id!)}
                          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-white border border-violet-200 rounded-md hover:bg-violet-50 hover:border-violet-300 transition-colors'
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Cashfree Style */}
          {totalPages > 1 && (
            <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
              <p className='text-sm text-gray-600'>
                Showing <span className='font-medium'>{startIndex + 1}</span> to{' '}
                <span className='font-medium'>
                  {Math.min(endIndex, filteredQuotations.length)}
                </span>{' '}
                of{' '}
                <span className='font-medium'>{filteredQuotations.length}</span>{' '}
                results
              </p>

              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' />
                </button>

                {getPageNumbers().map((page, index) => (
                  <span key={index}>
                    {page === '...' ? (
                      <span className='px-3 py-2 text-sm text-gray-400'>
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(page as number)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-violet-600 text-white border border-violet-600'
                            : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </span>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
                >
                  <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredQuotations.length > 0 && (
          <div className='mt-4 flex items-center justify-between text-sm'>
            <span className='text-gray-500'>
              Showing {filteredQuotations.length} quotation
              {filteredQuotations.length !== 1 ? 's' : ''}
            </span>
            <div className='flex items-center gap-2 text-violet-600'>
              <Printer size={15} />
              <span className='font-medium'>
                Click Preview to print quotation documents
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewQuotationListPage;
