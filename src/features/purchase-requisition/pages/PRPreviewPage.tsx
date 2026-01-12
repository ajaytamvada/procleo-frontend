import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Filter,
  Printer,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import {
  useSubmittedPurchaseRequests,
  usePurchaseRequest,
} from '@/features/purchase/hooks/usePurchaseRequestAPI';
import { FilePreviewModal } from '@/components/common/FilePreviewModal';

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
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const itemsPerPage = 15;

  // If ID is provided, fetch single PR details. Otherwise fetch all submitted PRs
  const { data: singlePR, isLoading: isLoadingSingle } = usePurchaseRequest(
    id ? parseInt(id) : 0
  );
  const { data: submittedPRs, isLoading: isLoadingList } =
    useSubmittedPurchaseRequests();

  const loading = id ? isLoadingSingle : isLoadingList;
  const items = id && singlePR ? [singlePR] : submittedPRs || [];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        !searchTerm ||
        item.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Pagination (1-based indexing)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(items.map(item => item.status).filter(Boolean)));
  }, [items]);

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

  // Reset to first page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleView = (requestNumber: string) => {
    const pr = items.find(p => p.requestNumber === requestNumber);
    if (pr?.id) {
      navigate(`/purchase-requisition/preview/${pr.id}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/purchase-requisition/preview');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='flex flex-col items-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            <p className='text-sm text-gray-500 mt-3'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-6'>
        {/* Page Header */}
        <div className='mb-6'>
          <h1 className='text-xl font-semibold text-gray-900'>PR Preview</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Preview and print purchase requisitions
          </p>
        </div>

        {/* Empty State */}
        <div className='bg-white rounded-lg border border-gray-200 py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>No Data Found</p>
            <p className='text-gray-400 text-sm mt-1'>
              No submitted purchase requests found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6 print:hidden'>
        <div className='flex items-center space-x-4'>
          {id && (
            <button
              onClick={handleBack}
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='h-6 w-6' />
            </button>
          )}
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>PR Preview</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Preview and print purchase requisitions
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Printer className='h-4 w-4' />
          <span>Print</span>
        </button>
      </div>

      {/* Search and Filter - Only show in list view */}
      {!id && (
        <div className='flex flex-col sm:flex-row gap-4 mb-6 print:hidden'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              type='text'
              placeholder='Search by request number, requestor, or department...'
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
                  {status
                    ? status.charAt(0).toUpperCase() + status.slice(1)
                    : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table - Only show in list view */}
      {!id && (
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-6 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide w-16'>
                    S.No
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Request Number
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Request Date
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Requested By
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Department
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Project
                  </th>
                  <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                    Grand Total
                  </th>
                  <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {paginatedItems.map((item, index) => (
                  <tr
                    key={item.requestNumber}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center'>
                      {startIndex + index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button
                        onClick={() => handleView(item.requestNumber || '')}
                        className='text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline'
                      >
                        {item.requestNumber || '-'}
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
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {item.departmentName || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {item.projectName || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right'>
                      ₹
                      {item.grandTotal?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
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

          {/* Empty State for filtered results */}
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
      )}

      {/* Detailed PR View for Single PR */}
      {id && singlePR && singlePR.items && (
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden mt-6'>
          <div className='p-6'>
            <h2 className='text-base font-semibold text-gray-900 mb-6'>
              Purchase Request Details
            </h2>

            <div className='grid grid-cols-2 gap-6 mb-8'>
              <div className='space-y-3'>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    PR Number:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {singlePR.requestNumber}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    Department:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {singlePR.departmentName || '-'}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    Project:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {singlePR.projectName || '-'}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    Remarks:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {singlePR.remarks || '-'}
                  </span>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    PR Date:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {singlePR.requestDate
                      ? new Date(singlePR.requestDate).toLocaleDateString()
                      : '-'}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    Requested By:
                  </span>
                  <span className='text-sm text-gray-900'>
                    {singlePR.requestedBy}
                  </span>
                </div>
                <div className='flex items-center'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    Status:
                  </span>
                  <Badge className={getStatusColor(singlePR.status || '')}>
                    {singlePR.status || 'Draft'}
                  </Badge>
                </div>
                <div className='flex'>
                  <span className='text-sm font-medium text-gray-500 w-32'>
                    Grand Total:
                  </span>
                  <span className='text-sm font-semibold text-gray-900'>
                    ₹
                    {singlePR.grandTotal?.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </span>
                </div>
              </div>
              {singlePR.attachments && (
                <div className='flex flex-col mt-4 col-span-2'>
                  <span className='text-sm font-medium text-gray-500 w-32 mb-1'>
                    Attachments:
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {singlePR.attachments
                      .split(',')
                      .filter(f => f.trim())
                      .map((filename, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewFile(filename)}
                          className='inline-flex items-center px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-blue-600 hover:bg-gray-200 hover:underline cursor-pointer'
                        >
                          {filename}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <FilePreviewModal
              isOpen={!!previewFile}
              onClose={() => setPreviewFile(null)}
              filename={previewFile || ''}
            />

            {/* Items Table */}
            <div>
              <h3 className='text-sm font-semibold text-gray-900 mb-4'>
                Line Items
              </h3>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <table className='min-w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide w-16'>
                        S.No
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Model Name
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Make
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Category
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Description
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                        Quantity
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {singlePR.items.map((item, index) => (
                      <tr
                        key={index}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-4 py-3.5 text-sm text-gray-600 text-center'>
                          {index + 1}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-700'>
                          {item.modelName || '-'}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600'>
                          {item.make || '-'}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600'>
                          {item.categoryName || '-'}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600'>
                          {item.description || '-'}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600 text-right'>
                          {item.quantity || 0}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600 text-right'>
                          ₹
                          {item.unitPrice?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || '0.00'}
                        </td>
                        <td className='px-4 py-3.5 text-sm font-medium text-gray-900 text-right'>
                          ₹
                          {item.totalPrice?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Grand Total Row */}
                <div className='px-6 py-4 bg-white border-t border-gray-200 flex justify-end'>
                  <div className='flex items-center gap-8'>
                    <span className='text-sm font-semibold text-gray-600'>
                      Grand Total
                    </span>
                    <span className='text-lg font-bold text-gray-900'>
                      ₹
                      {singlePR.grandTotal?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRPreviewPage;
