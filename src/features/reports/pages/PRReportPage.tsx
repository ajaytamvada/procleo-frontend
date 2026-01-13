import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePRReport } from '../hooks/useReports';
import { exportPRReportToExcel } from '../utils/excelExport';

const PRReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: reportData, isLoading } = usePRReport(startDate, endDate);

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!reportData) return [];
    return reportData.filter(
      item =>
        searchTerm === '' ||
        item.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reportData, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      exportPRReportToExcel(filteredData);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-gray-900'>
          Purchase Requisition Report
        </h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          View and analyze purchase requisition data
        </p>
      </div>

      {/* Filters Card */}
      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Start Date
            </label>
            <input
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              End Date
            </label>
            <input
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Search
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder='Search by PR Number, Requested By, Item, Department...'
                className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
              />
            </div>
          </div>
        </div>
        {filteredData && filteredData.length > 0 && (
          <div className='mt-4 pt-4 border-t border-gray-100'>
            <button
              onClick={handleExportToExcel}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors'
            >
              <Download size={15} />
              Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* Report Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading report data...
              </p>
            </div>
          ) : paginatedData && paginatedData.length > 0 ? (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    S No.
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    PR No.
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    PR Date
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Requested By
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Item Name
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Status
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    QTY
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Approx Unit Price
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {paginatedData.map((item, index) => (
                  <tr
                    key={`${item.id}-${index}`}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {startIndex + index + 1}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {item.prNumber}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {item.prDate}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {item.requestedByName || item.requestedBy}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {item.itemName}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.statusOfRM)}`}
                      >
                        {item.statusOfRM}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-right text-sm text-gray-700'>
                      {item.quantity}
                    </td>
                    <td className='px-4 py-3.5 text-right text-sm font-medium text-gray-900'>
                      ₹
                      {item.approxUnitPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {item.department}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <FileText className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No data found</p>
              <p className='text-gray-400 text-sm mt-1'>
                {searchTerm || startDate || endDate
                  ? 'Try adjusting your search criteria or date range'
                  : 'No records found for the selected criteria'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startIndex + 1}</span> to{' '}
              <span className='font-medium'>
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span className='font-medium'>{filteredData.length}</span>{' '}
              results
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              {getPageNumbers().map((page, idx) => (
                <React.Fragment key={idx}>
                  {page === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
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
                </React.Fragment>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PRReportPage;
