import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
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
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>PR Status</h1>
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col sm:flex-row gap-4 mb-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by PR number, requestor, or item...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Filter className='h-4 w-4 text-gray-400' />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
      <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16'>
                  S.No
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  PR Number
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  PR Date
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Requested By
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Item
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Approved By
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Remark
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedItems.map((item, index) => (
                <tr
                  key={`${item.requestNumber}-${item.itemId}-${index}`}
                  className='hover:bg-gray-50'
                >
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                    {startIndex + index + 1}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <button className='text-blue-600 hover:text-blue-800 hover:underline font-medium'>
                      {item.requestNumber}
                    </button>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.requestDate
                      ? new Date(item.requestDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.requestedBy || '-'}
                  </td>
                  <td
                    className='px-4 py-4 text-sm text-gray-900 max-w-xs truncate'
                    title={item.model}
                  >
                    {item.model || '-'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.approvedBy || 'NA'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
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
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.remarks || '-'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right'>
                    {item.quantity || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  Showing <span className='font-medium'>{startIndex + 1}</span>{' '}
                  to{' '}
                  <span className='font-medium'>
                    {Math.min(endIndex, filteredItems.length)}
                  </span>{' '}
                  of <span className='font-medium'>{filteredItems.length}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav
                  className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                  aria-label='Pagination'
                >
                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <span className='sr-only'>Previous</span>
                    <svg
                      className='h-5 w-5'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <span className='sr-only'>Next</span>
                    <svg
                      className='h-5 w-5'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredItems.length === 0 && statusItems.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No results match your search criteria</p>
        </div>
      )}
    </div>
  );
};
