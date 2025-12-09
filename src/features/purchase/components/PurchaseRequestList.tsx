import React, { useState } from 'react';
import { Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import type { PurchaseRequest, PurchaseRequestFilters } from '../types';
import { useDepartmentsList } from '@/features/master/hooks/useDepartmentAPI';

interface PurchaseRequestListProps {
  purchaseRequests: PurchaseRequest[];
  onEdit: (pr: PurchaseRequest) => void;
  onView: (pr: PurchaseRequest) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: PurchaseRequestFilters) => void;
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const PurchaseRequestList: React.FC<PurchaseRequestListProps> = ({
  purchaseRequests,
  onEdit,
  onView,
  onDelete,
  isLoading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<PurchaseRequestFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: departments = [] } = useDepartmentsList();

  const handleSearch = () => {
    onFiltersChange(filters);
    onPageChange(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersChange({});
    onPageChange(0);
  };

  const handleDelete = (id: number, requestNumber?: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete purchase request "${requestNumber}"?`
      )
    ) {
      onDelete(id!);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div>
      {/* Filters Section */}
      <div className='bg-white p-4 rounded-lg shadow mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium'
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Request Number
              </label>
              <input
                type='text'
                value={filters.requestNumber || ''}
                onChange={e =>
                  setFilters({ ...filters, requestNumber: e.target.value })
                }
                placeholder='Search by request number'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Requested By
              </label>
              <input
                type='text'
                value={filters.requestedBy || ''}
                onChange={e =>
                  setFilters({ ...filters, requestedBy: e.target.value })
                }
                placeholder='Search by requestor'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Department
              </label>
              <select
                value={filters.departmentId || ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    departmentId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={e =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Status</option>
                <option value='draft'>Draft</option>
                <option value='pending'>Pending</option>
                <option value='approved'>Approved</option>
                <option value='rejected'>Rejected</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                From Date
              </label>
              <input
                type='date'
                value={filters.fromDate || ''}
                onChange={e =>
                  setFilters({ ...filters, fromDate: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                To Date
              </label>
              <input
                type='date'
                value={filters.toDate || ''}
                onChange={e =>
                  setFilters({ ...filters, toDate: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='flex items-end gap-2 md:col-span-2 lg:col-span-3'>
              <button
                onClick={handleSearch}
                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2'
              >
                <Search size={16} />
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md'
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        {isLoading ? (
          <div className='p-8 text-center text-gray-500'>Loading...</div>
        ) : purchaseRequests.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
              <Search className='h-6 w-6 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No Data Found
            </h3>
            <p className='text-gray-500'>
              No purchase requests found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Request Number
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Request Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Requested By
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Department
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Project
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Grand Total
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {purchaseRequests.map(pr => (
                    <tr key={pr.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => onView(pr)}
                          className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                        >
                          {pr.requestNumber || '-'}
                        </button>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatDate(pr.requestDate)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.requestedBy || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.departmentName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.projectName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {formatCurrency(pr.grandTotal)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            pr.status
                          )}`}
                        >
                          {pr.status || 'Draft'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => onView(pr)}
                          className='text-gray-600 hover:text-gray-900 mr-3'
                          title='View'
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(pr)}
                          className='text-blue-600 hover:text-blue-900 mr-3'
                          title='Edit'
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pr.id!, pr.requestNumber)}
                          className='text-red-600 hover:text-red-900'
                          title='Delete'
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200'>
              <div className='text-sm text-gray-700'>
                Showing {page * 15 + 1} to{' '}
                {Math.min((page + 1) * 15, totalElements)} of {totalElements}{' '}
                records
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 0}
                  className='px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
                >
                  Previous
                </button>
                <span className='px-3 py-1 text-sm text-gray-700'>
                  Page {page + 1} of {totalPages || 1}
                </span>
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className='px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequestList;
