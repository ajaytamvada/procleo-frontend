/**
 * RFP Preview List Page
 * Shows list of floated RFPs with suppliers for preview/printing
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useRFPsByStatus } from '../hooks/useRFPPreview';

export const RFPPreviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch floated RFPs
  const {
    data: rfps = [],
    isLoading,
    error,
    refetch,
  } = useRFPsByStatus('FLOATED');

  // Filter RFPs based on search term
  const filteredRFPs = rfps.filter(
    rfp =>
      !searchTerm ||
      rfp.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Flatten RFPs to show one row per supplier
  const rfpSupplierRows = filteredRFPs.flatMap(rfp =>
    (rfp.suppliers || []).map(supplier => ({
      rfp,
      supplier,
    }))
  );

  // Pagination calculations
  const totalPages = Math.ceil(rfpSupplierRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = rfpSupplierRows.slice(startIndex, endIndex);

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

  const handlePreview = (rfpId: number, supplierId: number) => {
    navigate(`/rfp/${rfpId}/preview/${supplierId}`);
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>RFP Preview</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              View and print floated RFPs
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by RFP number, PR number, or requested by...'
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
          <div className='mb-4 bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-sm font-medium text-red-800'>
              Error loading RFPs
            </p>
            <p className='text-sm text-red-600 mt-0.5'>
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* RFP Table Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    RFP No
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Supplier Name
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Request Date
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Requested By
                  </th>
                  <th className='px-6 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                    Items
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
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
                          Loading RFPs...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                          <FileText className='w-6 h-6 text-gray-400' />
                        </div>
                        <p className='text-gray-600 font-medium'>
                          {searchTerm
                            ? 'No matching RFPs found'
                            : 'No floated RFPs'}
                        </p>
                        <p className='text-gray-400 text-sm mt-1'>
                          {searchTerm
                            ? 'Try adjusting your search criteria'
                            : 'Floated RFPs will appear here for preview and printing'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, index) => (
                    <tr
                      key={`${row.rfp.id}-${row.supplier.supplierId}-${index}`}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <span className='text-sm font-medium text-violet-600'>
                          {row.rfp.rfpNumber}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Building2 size={14} className='text-violet-600' />
                          </div>
                          <span className='text-sm text-gray-700'>
                            {row.supplier.supplierName ||
                              `Supplier ${row.supplier.supplierId}`}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {new Date(row.rfp.requestDate).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {row.rfp.requestedBy || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700'>
                          {row.rfp.items?.length || 0} items
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() =>
                            handlePreview(row.rfp.id!, row.supplier.supplierId)
                          }
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
                  {Math.min(endIndex, rfpSupplierRows.length)}
                </span>{' '}
                of <span className='font-medium'>{rfpSupplierRows.length}</span>{' '}
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
        {rfpSupplierRows.length > 0 && (
          <div className='mt-4 text-sm text-gray-500'>
            Showing {rfpSupplierRows.length} supplier
            {rfpSupplierRows.length !== 1 ? 's' : ''} across{' '}
            {filteredRFPs.length} RFP{filteredRFPs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPPreviewListPage;
