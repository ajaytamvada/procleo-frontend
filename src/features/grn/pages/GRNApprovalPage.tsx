import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePendingApprovalGRNs,
  useApproveGRN,
  useRejectGRN,
} from '../hooks/useGRN';
import type { ApproveGRNRequest } from '../types';

const GRNApprovalPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedGRN, setSelectedGRN] = useState<number | null>(null);
  const [approvalDate, setApprovalDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState('');
  const [qualityCheckStatus, setQualityCheckStatus] = useState('PENDING');
  const [qualityRemarks, setQualityRemarks] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'REJECT'>(
    'APPROVE'
  );

  const { data: pendingGRNs, isLoading } = usePendingApprovalGRNs();
  const approveMutation = useApproveGRN();
  const rejectMutation = useRejectGRN();

  // Filter GRNs by search term and date range
  const filteredGRNs = pendingGRNs?.filter(grn => {
    const matchesSearch =
      searchTerm === '' ||
      grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange =
      (dateFrom === '' || grn.receivedDate >= dateFrom) &&
      (dateTo === '' || grn.receivedDate <= dateTo);

    return matchesSearch && matchesDateRange;
  });

  const openApprovalModal = (grnId: number, action: 'APPROVE' | 'REJECT') => {
    setSelectedGRN(grnId);
    setApprovalAction(action);
    setApprovalDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setQualityCheckStatus(action === 'APPROVE' ? 'PASSED' : 'PENDING');
    setQualityRemarks('');
    setShowApprovalModal(true);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedGRN(null);
    setRemarks('');
    setQualityRemarks('');
  };

  const handleApproval = async () => {
    if (!selectedGRN) return;

    if (approvalAction === 'REJECT' && !remarks) {
      toast.error('Please provide remarks for rejection');
      return;
    }

    const request: ApproveGRNRequest = {
      action: approvalAction,
      remarks: remarks || undefined,
      qualityCheckStatus: qualityCheckStatus || undefined,
      qualityCheckRemarks: qualityRemarks || undefined,
    };

    try {
      if (approvalAction === 'APPROVE') {
        await approveMutation.mutateAsync({ id: selectedGRN, request });
      } else {
        await rejectMutation.mutateAsync({ id: selectedGRN, request });
      }
      closeApprovalModal();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const getGRNById = (id: number) => {
    return pendingGRNs?.find(grn => grn.id === id);
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>GRN Approval</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Review and approve Goods Receipt Notes
        </p>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-2'>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search by GRN, Invoice number or Supplier...'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <input
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder='From Date'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <input
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder='To Date'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {/* GRNs Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : filteredGRNs && filteredGRNs.length > 0 ? (
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    GRN Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    GRN Date
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice Date
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Supplier
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Items
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Total Value
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredGRNs.map(grn => (
                  <tr key={grn.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-center'>
                      <div className='font-medium text-blue-600'>
                        {grn.grnNumber}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {grn.createdByName || grn.createdBy}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.receivedDate}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.invoiceNumber}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.invoiceDate}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='text-sm text-gray-900'>
                        {grn.supplierName}
                      </div>
                      {grn.supplierCode && (
                        <div className='text-xs text-gray-500'>
                          {grn.supplierCode}
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.items.length}
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-semibold text-gray-900'>
                      ₹{grn.totalReceivedValue.toFixed(2)}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => {
                            /* Navigate to view details */
                          }}
                          className='p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                          title='View Details'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => openApprovalModal(grn.id, 'APPROVE')}
                          disabled={approveMutation.isPending}
                          className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50'
                          title='Approve'
                        >
                          <div className='flex items-center gap-1'>
                            <CheckCircle className='w-4 h-4' />
                            Approve
                          </div>
                        </button>
                        <button
                          onClick={() => openApprovalModal(grn.id, 'REJECT')}
                          disabled={rejectMutation.isPending}
                          className='px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50'
                          title='Reject'
                        >
                          <div className='flex items-center gap-1'>
                            <XCircle className='w-4 h-4' />
                            Reject
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='p-12 text-center text-gray-500'>
              <p className='text-lg font-medium'>No GRNs pending approval</p>
              <p className='text-sm mt-1'>
                {searchTerm || dateFrom || dateTo
                  ? 'Try adjusting your search criteria or date range'
                  : 'All GRNs have been processed'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedGRN && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              {approvalAction === 'APPROVE' ? 'Approve GRN' : 'Reject GRN'}
            </h2>

            {/* GRN Details */}
            {getGRNById(selectedGRN) && (
              <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-600'>GRN Number:</span>
                    <p className='font-semibold'>
                      {getGRNById(selectedGRN)?.grnNumber}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Invoice Number:</span>
                    <p className='font-semibold'>
                      {getGRNById(selectedGRN)?.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Supplier:</span>
                    <p className='font-semibold'>
                      {getGRNById(selectedGRN)?.supplierName}
                    </p>
                  </div>
                  <div>
                    <span className='text-gray-600'>Total Value:</span>
                    <p className='font-semibold'>
                      ₹{getGRNById(selectedGRN)?.totalReceivedValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Form */}
            <div className='space-y-4'>
              {approvalAction === 'APPROVE' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Approval Date <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='date'
                      value={approvalDate}
                      onChange={e => setApprovalDate(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quality Check Status
                    </label>
                    <select
                      value={qualityCheckStatus}
                      onChange={e => setQualityCheckStatus(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='PENDING'>Pending</option>
                      <option value='PASSED'>Passed</option>
                      <option value='FAILED'>Failed</option>
                      <option value='PARTIALLY_PASSED'>Partially Passed</option>
                      <option value='NOT_APPLICABLE'>Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quality Check Remarks
                    </label>
                    <textarea
                      value={qualityRemarks}
                      onChange={e => setQualityRemarks(e.target.value)}
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      placeholder='Enter quality check remarks (optional)'
                    />
                  </div>
                </>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks{' '}
                  {approvalAction === 'REJECT' && (
                    <span className='text-red-500'>*</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder={
                    approvalAction === 'APPROVE'
                      ? 'Enter approval remarks (optional)'
                      : 'Enter rejection reason'
                  }
                  required={approvalAction === 'REJECT'}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className='mt-6 flex justify-end gap-3'>
              <button
                onClick={closeApprovalModal}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleApproval}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  approvalAction === 'APPROVE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approvalAction === 'APPROVE' ? 'Approve GRN' : 'Reject GRN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNApprovalPage;
