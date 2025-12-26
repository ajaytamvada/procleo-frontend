import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePRStatus } from '@/features/purchase/hooks/usePurchaseRequestAPI';
import type { PRStatus } from '@/features/purchase/types';

const getStatusColor = (status: string) => {
  const lowerStatus = status?.toLowerCase() || '';
  switch (lowerStatus) {
    case 'approved':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'waiting':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    case 'cancelled':
    case 'canceled':
      return 'bg-slate-100 text-slate-800 border border-slate-200';
    case 'on hold':
    case 'hold':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'in progress':
    case 'processing':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'completed':
      return 'bg-teal-100 text-teal-800 border border-teal-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

export const PRStatusPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Fetch PR status data from API with search
  const {
    data: statusItems = [],
    isLoading,
    isError,
  } = usePRStatus(debouncedSearch || undefined);

  // Client-side filtering by status
  const filteredItems = useMemo(() => {
    return statusItems.filter(item => {
      const matchesStatus =
        !statusFilter ||
        item.approvalStatus?.toLowerCase() === statusFilter.toLowerCase() ||
        item.rmApprovalStatus?.toLowerCase() === statusFilter.toLowerCase();

      return matchesStatus;
    });
  }, [statusItems, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    statusItems.forEach(item => {
      if (item.approvalStatus) statuses.add(item.approvalStatus);
      if (item.rmApprovalStatus) statuses.add(item.rmApprovalStatus);
    });
    return Array.from(statuses);
  }, [statusItems]);

  // Generate page numbers with ellipsis (Cashfree style)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
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

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Show error toast
  React.useEffect(() => {
    if (isError) {
      toast.error('Failed to load PR status data');
    }
  }, [isError]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-6'>
      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-gray-900'>PR Status</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Track the status of your purchase requisitions
        </p>
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by PR number, requestor, or item...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10 py-2.5 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          />
        </div>

        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-gray-400' />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          >
            <option value=''>All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              <tr className='bg-[#fafbfc]'>
                <th className='px-6 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide w-16'>
                  S.No
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  PR Number
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  PR Date
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Requested By
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Item
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Approved By
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Status
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Remark
                </th>
                <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {paginatedItems.map((item, index) => (
                <tr
                  key={`${item.requestNumber}-${item.itemId}-${index}`}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center'>
                    {startIndex + index + 1}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <button className='text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline'>
                      {item.requestNumber}
                    </button>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {item.requestDate
                      ? new Date(item.requestDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {item.requestedBy || '-'}
                  </td>
                  <td
                    className='px-6 py-4 text-sm text-gray-600 max-w-xs truncate'
                    title={item.model}
                  >
                    {item.model || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {item.approvedBy || 'NA'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <Badge
                      className={getStatusColor(
                        item.rmApprovalStatus || item.approvalStatus
                      )}
                    >
                      {(
                        item.rmApprovalStatus ||
                        item.approvalStatus ||
                        'Pending'
                      )
                        .charAt(0)
                        .toUpperCase() +
                        (
                          item.rmApprovalStatus ||
                          item.approvalStatus ||
                          'Pending'
                        ).slice(1)}
                    </Badge>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {item.remarks || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right'>
                    {item.quantity || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedItems.length === 0 && (
          <div className='py-16 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>No results found</p>
            <p className='text-gray-400 text-sm mt-1'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Pagination - Cashfree Style */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startIndex + 1}</span> to{' '}
              <span className='font-medium'>
                {Math.min(endIndex, filteredItems.length)}
              </span>{' '}
              of <span className='font-medium'>{filteredItems.length}</span>{' '}
              results
            </p>

            <div className='flex items-center gap-1'>
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
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

              {/* Next Button */}
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
  );
};

export default PRStatusPage;
