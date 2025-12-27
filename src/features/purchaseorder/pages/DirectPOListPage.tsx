/**
 * Direct PO List Page
 * Shows list of Direct Purchase Orders (created without PR/RFP)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  AlertCircle,
  Calendar,
  FileText,
  Eye,
  Package,
  Building,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { format, parseISO } from 'date-fns';

export const DirectPOListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data: allPOs = [], isLoading, error } = usePurchaseOrders();

  // Filter for Direct POs only
  const directPOs = allPOs.filter((po: any) => po.poType === 'DIRECT');

  // Further filter based on search term
  const filteredPOs = directPOs.filter(
    (po: any) =>
      !searchTerm ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.raisedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPOs = filteredPOs.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      CREATED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Created' },
      SUBMITTED: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Submitted',
      },
      APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approved',
      },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span
        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
          <span className='text-2xl'>⚠️</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Error Loading Data
        </h3>
        <p className='text-gray-500'>
          {error instanceof Error
            ? error.message
            : 'Failed to load Direct POs. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-800'>
            Direct Purchase Orders
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage POs created without PR/RFP workflow
          </p>
        </div>
        <Button
          onClick={() => navigate('/purchase-orders/direct/create')}
          className='inline-flex items-center'
        >
          <Plus className='w-4 h-4 mr-2' />
          New Direct PO
        </Button>
      </div>

      {/* Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by PO number, supplier, or raised by...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Table */}
      {filteredPOs.length === 0 ? (
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <Package className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Data Found
          </h3>
          <p className='text-gray-500'>
            {searchTerm
              ? 'No matching Direct POs found'
              : 'No Direct POs available. Create your first Direct PO to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-[#F7F8FA]'>
                  <tr>
                    <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide w-16'>
                      S.No
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      PO Number
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      PO Date
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Supplier
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Raised By
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Department
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Status
                    </th>
                    <th className='px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Total Amount
                    </th>
                    <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {paginatedPOs.map((po: any, index) => (
                    <tr
                      key={po.id}
                      className='hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 text-center'>
                        {startIndex + index + 1}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          className='text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline'
                        >
                          {po.poNumber}
                        </button>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        {po.poDate ? formatDate(po.poDate) : 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-700'>
                        {po.supplierName || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        {po.raisedBy || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        {po.department || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {getStatusBadge(po.status)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900'>
                        ₹{' '}
                        {po.grandTotal?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '0.00'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <button
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          className='inline-flex items-center px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-md transition-colors'
                        >
                          <Eye className='w-4 h-4 mr-1.5' />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-700'>
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, filteredPOs.length)} of {filteredPOs.length}{' '}
                results
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                  className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DirectPOListPage;
