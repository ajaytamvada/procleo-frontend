import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { RFP, RFPFilterParams } from '../types';
import { RFPStatus } from '../types';
import { rfpApi } from '../services/rfpApi';

const FloatRFPListPage: React.FC = () => {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: RFPFilterParams = {
        page: 0,
        size: 100,
        sortBy: 'createdDate',
        sortDirection: 'DESC',
        status: RFPStatus.CREATED,
      };

      const response = await rfpApi.getAllRFPs(params);
      setRfps(response.content);
    } catch (err) {
      console.error('Error fetching RFPs:', err);
      setError('Failed to load RFPs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFloat = (id: number) => {
    navigate(`/rfp/${id}/float`);
  };

  const filteredRFPs = rfps.filter(
    rfp =>
      !searchTerm ||
      (rfp.rfpNumber &&
        rfp.rfpNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rfp.remarks &&
        rfp.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredRFPs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRFPs = filteredRFPs.slice(startIndex, endIndex);

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

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Float RFP</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Select an RFP to float to suppliers
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by RFP Number or Remarks...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <button
            onClick={fetchRFPs}
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
                Error loading RFPs
              </p>
              <p className='text-sm text-red-600 mt-0.5'>{error}</p>
            </div>
          </div>
        )}

        {/* RFP Table Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    RFP Details
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Dates
                  </th>
                  <th className='px-6 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                    Items
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Status
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {loading ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                        <p className='text-sm text-gray-500 mt-3'>
                          Loading RFPs...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRFPs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                          <FileText className='w-6 h-6 text-gray-400' />
                        </div>
                        <p className='text-gray-600 font-medium'>
                          No RFPs found
                        </p>
                        <p className='text-gray-400 text-sm mt-1'>
                          {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'There are no RFPs ready to be floated'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRFPs.map(rfp => (
                    <tr
                      key={rfp.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex flex-col'>
                          <span className='text-sm font-medium text-violet-600'>
                            {rfp.rfpNumber}
                          </span>
                          {rfp.remarks && (
                            <span className='text-sm text-gray-600 mt-1 line-clamp-1'>
                              {rfp.remarks}
                            </span>
                          )}
                          <span className='text-xs text-gray-400 mt-1'>
                            Dept: {rfp.department || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col gap-1.5'>
                          <div className='flex items-center text-xs'>
                            <span className='text-gray-400 w-16'>Created:</span>
                            <span className='text-gray-600 font-medium'>
                              {rfp.createdDate
                                ? new Date(rfp.createdDate).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                          <div className='flex items-center text-xs'>
                            <span className='text-gray-400 w-16'>Closing:</span>
                            <span className='text-gray-600 font-medium'>
                              {rfp.closingDate
                                ? new Date(rfp.closingDate).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700'>
                          {rfp.items?.length || 0} items
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200'>
                          {rfp.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => handleFloat(rfp.id!)}
                          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
                        >
                          <Send size={14} />
                          Float RFP
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
                  {Math.min(endIndex, filteredRFPs.length)}
                </span>{' '}
                of <span className='font-medium'>{filteredRFPs.length}</span>{' '}
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
      </div>
    </div>
  );
};

export default FloatRFPListPage;
