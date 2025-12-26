/**
 * Re-Submit Quotation List Page
 * Shows list of submitted quotations that can be modified/re-submitted
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Edit,
  FileText,
  Building2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useSubmittedQuotations } from '../hooks/useReSubmitQuotation';

export const ReSubmitQuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch submitted quotations
  const {
    data: rfps = [],
    isLoading,
    error,
    refetch,
  } = useSubmittedQuotations();

  // Filter RFPs based on search term
  const filteredRFPs = rfps.filter(
    rfp =>
      !searchTerm ||
      rfp.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Flatten to show one row per quotation and filter for NEGOTIATION status
  const quotationRows = filteredRFPs.flatMap(rfp =>
    (rfp.quotations || [])
      .filter(quotation => quotation.status === 'NEGOTIATION')
      .map(quotation => ({
        rfp,
        quotation,
        supplier: rfp.suppliers?.find(
          s => s.supplierId === quotation.supplierId
        ),
      }))
  );

  // Pagination calculations
  const totalPages = Math.ceil(quotationRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = quotationRows.slice(startIndex, endIndex);

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

  const handleEditQuotation = (rfpId: number, quotationId: number) => {
    navigate(`/rfp/${rfpId}/resubmit-quotation/${quotationId}`);
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Re-Submit RFP
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Modify and re-submit existing quotations
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by RFP number or requested by...'
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
                    Supplier Name
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    RFP Number
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Quotation Number
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Quotation Date
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Created By
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Status
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Amount
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                        <p className='text-sm text-gray-500 mt-3'>
                          Loading submitted quotations...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                          <FileText className='w-6 h-6 text-gray-400' />
                        </div>
                        <p className='text-gray-600 font-medium'>
                          {searchTerm
                            ? 'No matching quotations found'
                            : 'No submitted quotations available'}
                        </p>
                        <p className='text-gray-400 text-sm mt-1'>
                          {searchTerm
                            ? 'Try adjusting your search criteria'
                            : 'Submitted quotations will appear here for modification'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, index) => (
                    <tr
                      key={`${row.quotation.id}-${index}`}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Building2 size={14} className='text-violet-600' />
                          </div>
                          <span className='text-sm font-medium text-gray-700'>
                            {row.supplier?.supplierName ||
                              row.quotation.supplierName ||
                              `Supplier ${row.quotation.supplierId}`}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='text-sm font-medium text-violet-600'>
                          {row.rfp.rfpNumber}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>
                        {row.quotation.quotationNumber || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {row.quotation.quotationDate
                          ? new Date(
                              row.quotation.quotationDate
                            ).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {row.rfp.requestedBy || 'N/A'}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            row.quotation.status === 'SUBMITTED'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : row.quotation.status === 'NEGOTIATION'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {row.quotation.status || 'SUBMITTED'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right text-sm font-medium text-gray-900'>
                        ₹
                        {(
                          row.quotation.netAmount ||
                          row.quotation.totalAmount ||
                          0
                        ).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() =>
                            handleEditQuotation(row.rfp.id!, row.quotation.id!)
                          }
                          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-white border border-violet-200 rounded-md hover:bg-violet-50 hover:border-violet-300 transition-colors'
                        >
                          <Edit size={14} />
                          Modify
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
                  {Math.min(endIndex, quotationRows.length)}
                </span>{' '}
                of <span className='font-medium'>{quotationRows.length}</span>{' '}
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
        {quotationRows.length > 0 && (
          <div className='mt-4 text-sm text-gray-500'>
            Showing {quotationRows.length} quotation
            {quotationRows.length !== 1 ? 's' : ''} available for modification
          </div>
        )}
      </div>
    </div>
  );
};

export default ReSubmitQuotationListPage;
