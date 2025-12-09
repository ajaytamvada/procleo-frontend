/**
 * Cancel PO Tab Component
 * Displays list of approved POs that can be cancelled with reason
 */

import React, { useState } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  FileText,
  XCircle,
  Package,
  Building,
} from 'lucide-react';
import {
  usePurchaseOrdersByStatus,
  useCancelPurchaseOrder,
} from '../hooks/usePurchaseOrders';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export const CancelPOTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    data: approvedPOs = [],
    isLoading,
    error,
  } = usePurchaseOrdersByStatus('APPROVED');
  const cancelMutation = useCancelPurchaseOrder();

  // Filter POs based on search term
  const filteredPOs = approvedPOs.filter(
    (po: any) =>
      !searchTerm ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.raisedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancelClick = (po: any) => {
    setSelectedPO(po);
    setCancelReason('');
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    if (!selectedPO) return;

    try {
      await cancelMutation.mutateAsync({
        id: selectedPO.id,
        reason: cancelReason,
      });
      setShowCancelDialog(false);
      setSelectedPO(null);
      setCancelReason('');
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleCancelClose = () => {
    setShowCancelDialog(false);
    setSelectedPO(null);
    setCancelReason('');
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
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        <span className='ml-2 text-gray-600'>Loading approved POs...</span>
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
              Error Loading Approved POs
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
    <div className='h-full flex flex-col'>
      {/* Search */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='relative max-w-md flex-1'>
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
          <div className='ml-4 flex items-center space-x-2 text-sm text-gray-600'>
            <Package className='w-5 h-5 text-green-600' />
            <span className='font-medium'>
              {filteredPOs.length} Approved PO
              {filteredPOs.length !== 1 ? 's' : ''}
            </span>
          </div>
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
                  ? 'No matching approved POs found'
                  : 'No approved POs'}
              </h3>
              <p className='text-gray-600 text-sm max-w-md mx-auto'>
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Approved purchase orders that can be cancelled will appear here.'}
              </p>
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
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900'>
                        ₹{' '}
                        {po.grandTotal?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '0.00'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <button
                          onClick={() => handleCancelClick(po)}
                          className='inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors'
                        >
                          <XCircle className='w-4 h-4 mr-1.5' />
                          Cancel
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
          <div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex items-start'>
              <AlertCircle className='w-5 h-5 text-yellow-600 mt-0.5 mr-3' />
              <div className='flex-1'>
                <h4 className='text-sm font-medium text-yellow-900'>
                  About Cancelling POs
                </h4>
                <p className='text-sm text-yellow-700 mt-1'>
                  Cancelling a purchase order will mark it as cancelled and
                  prevent any further processing. You must provide a reason for
                  cancellation. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Dialog Modal */}
      {showCancelDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
            <div className='p-6'>
              <div className='flex items-center mb-4'>
                <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4'>
                  <XCircle className='w-6 h-6 text-red-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Cancel Purchase Order
                  </h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    PO# {selectedPO?.poNumber}
                  </p>
                </div>
              </div>

              <div className='mb-4'>
                <p className='text-sm text-gray-700 mb-3'>
                  Are you sure you want to cancel this purchase order? This
                  action cannot be undone.
                </p>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Reason for Cancellation{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  placeholder='Please provide a reason for cancelling this purchase order...'
                />
              </div>

              <div className='flex justify-end space-x-3'>
                <button
                  onClick={handleCancelClose}
                  disabled={cancelMutation.isPending}
                  className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
                >
                  Close
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelMutation.isPending || !cancelReason.trim()}
                  className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className='w-4 h-4 mr-2' />
                      Confirm Cancellation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelPOTab;
