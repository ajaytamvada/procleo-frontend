import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Printer } from 'lucide-react';
import {
  useSubmittedPurchaseRequests,
  usePurchaseRequest,
} from '@/features/purchase/hooks/usePurchaseRequestAPI';

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
      return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
};

export const PRPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // If ID is provided, fetch single PR details. Otherwise fetch all submitted PRs
  const { data: singlePR, isLoading: isLoadingSingle } = usePurchaseRequest(
    id ? parseInt(id) : 0
  );
  const { data: submittedPRs, isLoading: isLoadingList } =
    useSubmittedPurchaseRequests();

  const loading = id ? isLoadingSingle : isLoadingList;
  const items = id && singlePR ? [singlePR] : submittedPRs || [];

  const filteredItems = items.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination (1-based indexing)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const uniqueStatuses = Array.from(
    new Set(items.map(item => item.status).filter(Boolean))
  );

  // Reset to first page when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleView = (requestNumber: string) => {
    const pr = items.find(p => p.requestNumber === requestNumber);
    if (pr?.id) {
      navigate(`/purchase-requisition/preview/${pr.id}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>PR Preview</h1>
        </div>
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <Search className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Data Found
          </h3>
          <p className='text-gray-500'>No submitted purchase requests found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between print:hidden'>
        <h1 className='text-2xl font-bold text-gray-900'>PR Preview</h1>
        <button
          onClick={handlePrint}
          className='flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
        >
          <Printer className='h-4 w-4' />
          <span>Print</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col sm:flex-row gap-4 mb-4 print:hidden'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by request number, requestor, or department...'
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Filter className='h-4 w-4 text-gray-400' />
          <select
            value={statusFilter}
            onChange={e => handleStatusFilterChange(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16'>
                  S.No
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Request Number
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Request Date
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Requested By
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Department
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Project
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Grand Total
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedItems.map((item, index) => (
                <tr key={item.requestNumber} className='hover:bg-gray-50'>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                    {startIndex + index + 1}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <button
                      onClick={() => handleView(item.requestNumber || '')}
                      className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                    >
                      {item.requestNumber || '-'}
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
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.departmentName || '-'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.projectName || '-'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    ₹{item.grandTotal?.toFixed(2) || '0.00'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <Badge className={getStatusColor(item.status || '')}>
                      {item.status
                        ? item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        : 'Draft'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

      {filteredItems.length === 0 && items.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No results match your search criteria</p>
        </div>
      )}

      {/* Detailed PR View for Single PR */}
      {id && singlePR && singlePR.items && (
        <div className='bg-white border border-gray-200 rounded-lg p-6 mt-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-6'>
            Purchase Request Details
          </h2>

          <div className='grid grid-cols-2 gap-6 mb-8'>
            <div className='space-y-2'>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>PR Number:</span>{' '}
                <span className='text-gray-900'>{singlePR.requestNumber}</span>
              </p>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>Department:</span>{' '}
                <span className='text-gray-900'>
                  {singlePR.departmentName || '-'}
                </span>
              </p>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>Project:</span>{' '}
                <span className='text-gray-900'>
                  {singlePR.projectName || '-'}
                </span>
              </p>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>Remarks:</span>{' '}
                <span className='text-gray-900'>{singlePR.remarks || '-'}</span>
              </p>
            </div>
            <div className='space-y-2'>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>PR Date:</span>{' '}
                <span className='text-gray-900'>
                  {singlePR.requestDate
                    ? new Date(singlePR.requestDate).toLocaleDateString()
                    : '-'}
                </span>
              </p>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>Requested By:</span>{' '}
                <span className='text-gray-900'>{singlePR.requestedBy}</span>
              </p>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>Status:</span>{' '}
                <Badge className={getStatusColor(singlePR.status || '')}>
                  {singlePR.status || 'Draft'}
                </Badge>
              </p>
              <p className='text-sm'>
                <span className='font-medium text-gray-700'>Grand Total:</span>{' '}
                <span className='text-gray-900 font-semibold'>
                  ₹{singlePR.grandTotal?.toFixed(2) || '0.00'}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>
              Line Items
            </h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 border border-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      S.No
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      Model Name
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      Make
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      Category
                    </th>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      Description
                    </th>
                    <th className='px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      Quantity
                    </th>
                    <th className='px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r'>
                      Unit Price
                    </th>
                    <th className='px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {singlePR.items.map((item, index) => (
                    <tr key={index} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center border-r'>
                        {index + 1}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 border-r'>
                        {item.modelName || '-'}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 border-r'>
                        {item.make || '-'}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 border-r'>
                        {item.categoryName || '-'}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 border-r'>
                        {item.description || '-'}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 text-right border-r'>
                        {item.quantity || 0}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 text-right border-r'>
                        ₹{item.unitPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-900 text-right'>
                        ₹{item.totalPrice?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className='bg-gray-50'>
                    <td
                      colSpan={7}
                      className='px-3 py-3 text-sm font-semibold text-gray-900 text-right border-r'
                    >
                      Grand Total
                    </td>
                    <td className='px-3 py-3 text-sm font-semibold text-gray-900 text-right'>
                      ₹{singlePR.grandTotal?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
