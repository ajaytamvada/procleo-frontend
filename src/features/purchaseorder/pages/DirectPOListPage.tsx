/**
 * Direct PO List Page
 * Shows list of Direct Purchase Orders (created without PR/RFP)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  FileText,
  Eye,
  Package,
  Building,
} from 'lucide-react';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { format, parseISO } from 'date-fns';

export const DirectPOListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        <span className='ml-2 text-gray-600'>Loading Direct POs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>
              Error Loading Direct POs
            </h3>
            <p className='text-red-600 text-sm mt-1'>
              {error instanceof Error
                ? error.message
                : 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Direct Purchase Orders
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              Manage POs created without PR/RFP workflow
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <Package className='w-5 h-5 text-blue-600' />
              <span className='font-medium'>
                {filteredPOs.length} Direct PO
                {filteredPOs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => navigate('/purchase-orders/direct/create')}
              className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm'
            >
              <Plus className='w-4 h-4 mr-2' />
              New Direct PO
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='relative max-w-md'>
          <Search
            size={18}
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            placeholder='Search by PO number, supplier, or raised by...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* PO List */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='bg-white rounded-lg border border-gray-200'>
          {filteredPOs.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4'>
                <Package size={32} className='text-gray-400' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                {searchTerm
                  ? 'No matching Direct POs found'
                  : 'No Direct POs yet'}
              </h3>
              <p className='text-gray-600 text-sm max-w-md mx-auto mb-4'>
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Create Direct Purchase Orders for urgent or small value purchases without going through PR/RFP workflow.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/purchase-orders/direct/create')}
                  className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Create Your First Direct PO
                </button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      PO Number
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      PO Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Supplier
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Raised By
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Department
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Total Amount
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredPOs.map((po: any) => (
                    <tr
                      key={po.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <FileText className='w-4 h-4 text-blue-600 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {po.poNumber}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-600'>
                          <Calendar className='w-4 h-4 mr-2' />
                          {po.poDate ? formatDate(po.poDate) : 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center text-sm'>
                          <Building className='w-4 h-4 mr-2 text-gray-400' />
                          <div className='font-medium text-gray-900'>
                            {po.supplierName || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {po.raisedBy || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
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
                          className='inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'
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
          )}
        </div>

        {/* Info Banner */}
        {filteredPOs.length > 0 && (
          <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start'>
              <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 mr-3' />
              <div className='flex-1'>
                <h4 className='text-sm font-medium text-blue-900'>
                  About Direct POs
                </h4>
                <p className='text-sm text-blue-700 mt-1'>
                  Direct Purchase Orders are created without going through the
                  PR/RFP workflow. Use them for urgent purchases, small value
                  procurements, or repeat orders from trusted suppliers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectPOListPage;
