/**
 * PO Approval List Page
 * Shows list of Purchase Orders with SUBMITTED status (pending approval)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Eye,
  Package,
  Building,
} from 'lucide-react';
import { usePurchaseOrdersByStatus } from '../hooks/usePurchaseOrders';
import { POStatus } from '../types';
import { format, parseISO } from 'date-fns';

export const POApprovalListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: pendingPOs = [],
    isLoading,
    error,
  } = usePurchaseOrdersByStatus(POStatus.SUBMITTED);

  // Filter POs based on search term
  const filteredPOs = pendingPOs.filter(
    (po: any) =>
      !searchTerm ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (poId: number) => {
    navigate(`/purchase-orders/approve/${poId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        <span className='ml-2 text-gray-600'>Loading pending POs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>Error Loading POs</h3>
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
              Approve Purchase Orders
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              Review and approve or reject pending purchase orders
            </p>
          </div>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <Package className='w-5 h-5 text-orange-600' />
            <span className='font-medium'>
              {filteredPOs.length} Pending PO
              {filteredPOs.length !== 1 ? 's' : ''}
            </span>
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
            placeholder='Search by PO number, supplier, or quotation...'
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
                {searchTerm ? 'No matching POs found' : 'No pending approvals'}
              </h3>
              <p className='text-gray-600 text-sm max-w-md mx-auto'>
                {searchTerm
                  ? 'Try adjusting your search criteria to find pending purchase orders'
                  : 'There are no purchase orders pending for approval at this time.'}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      PO Number
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      PO Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Supplier
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Quotation Number
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Raised By
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Department
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Total Amount
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
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
                          <div>
                            <div className='font-medium text-gray-900'>
                              {po.supplierName || 'N/A'}
                            </div>
                            {po.supplierId > 0 && (
                              <div className='text-xs text-gray-500'>
                                ID: {po.supplierId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {po.quotationNumber || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-600'>
                          <User className='w-4 h-4 mr-2' />
                          {po.raisedBy || 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {po.department || 'N/A'}
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
                          onClick={() => handleViewDetails(po.id)}
                          className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm'
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          Review
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
                  About PO Approval
                </h4>
                <p className='text-sm text-blue-700 mt-1'>
                  Click "Review" to view full PO details including items,
                  pricing, and shipping information. You can approve or reject
                  the purchase order with remarks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POApprovalListPage;
