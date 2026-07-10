import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Check, X, PackageCheck, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import {
  usePendingTransfers,
  useApproveTransfer,
  useRejectTransfer,
  useReceiveTransfer,
} from '../hooks/useAssets';
import type { AssetTransfer } from '../types';

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

const TRANSFER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

type TabFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

const AssetTransfersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialogId, setRejectDialogId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'receive';
    id: number;
  } | null>(null);

  const { data: pendingTransfers = [], isLoading } = usePendingTransfers();
  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();
  const receiveMutation = useReceiveTransfer();

  const { user } = useAuth();

  // requestedBy is the JWT principal, which is upper-cased; compare loosely.
  const isOwnRequest = (transfer: AssetTransfer) =>
    !!transfer.requestedBy &&
    !!user?.loginName &&
    transfer.requestedBy.toLowerCase() === user.loginName.toLowerCase();

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const filteredTransfers = useMemo(() => {
    return pendingTransfers.filter((t: AssetTransfer) => {
      const matchesTab = activeTab === 'ALL' || t.status === activeTab;
      const matchesSearch =
        !searchTerm ||
        t.transferNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromDepartmentName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        t.toDepartmentName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [pendingTransfers, activeTab, searchTerm]);

  const handleApprove = (id: number) => {
    approveMutation.mutate(id, {
      onSuccess: () => setConfirmAction(null),
    });
  };

  const handleReject = () => {
    if (rejectDialogId == null) return;
    rejectMutation.mutate(
      { id: rejectDialogId, reason: rejectReason || undefined },
      {
        onSuccess: () => {
          setRejectDialogId(null);
          setRejectReason('');
        },
      }
    );
  };

  const handleReceive = (id: number) => {
    receiveMutation.mutate(id, {
      onSuccess: () => setConfirmAction(null),
    });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
          <p className='text-sm text-gray-500 mt-3'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
          <ArrowRightLeft className='h-5 w-5 text-violet-600' />
          Asset Transfers
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Manage and track asset transfer requests
        </p>
      </div>

      {/* Tabs */}
      <div className='flex items-center gap-1 border-b border-gray-200'>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          type='text'
          placeholder='Search transfers...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Table */}
      {filteredTransfers.length === 0 ? (
        <div className='bg-white rounded-lg border border-gray-200 py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <ArrowRightLeft className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>No Transfers Found</p>
            <p className='text-gray-400 text-sm mt-1'>
              No transfer requests match your criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-[#F7F8FA]'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Transfer Number
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Asset Tag
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Type
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    From
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    To
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Requested Date
                  </th>
                  <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredTransfers.map((transfer: AssetTransfer) => (
                  <tr
                    key={transfer.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm font-medium text-violet-600'>
                        {transfer.transferNumber}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {transfer.assetTag}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {transfer.transferType}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {transfer.fromDepartmentName ||
                        transfer.fromEmployeeName ||
                        transfer.fromLocationName ||
                        '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {transfer.toDepartmentName ||
                        transfer.toEmployeeName ||
                        transfer.toLocationName ||
                        '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <Badge
                        className={
                          TRANSFER_STATUS_COLORS[transfer.status] ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {transfer.status}
                      </Badge>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {formatDate(transfer.requestedDate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        {transfer.status === 'PENDING' && (
                          <>
                            {/* Segregation of duties: the backend rejects a
                                transfer approved by its own requester. */}
                            {!isOwnRequest(transfer) && (
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: 'approve',
                                    id: transfer.id,
                                  })
                                }
                                className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors'
                                title='Approve'
                              >
                                <Check className='h-3.5 w-3.5' />
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => setRejectDialogId(transfer.id)}
                              className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors'
                              title={
                                isOwnRequest(transfer) ? 'Cancel' : 'Reject'
                              }
                            >
                              <X className='h-3.5 w-3.5' />
                              {isOwnRequest(transfer) ? 'Cancel' : 'Reject'}
                            </button>
                          </>
                        )}
                        {transfer.status === 'APPROVED' && (
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'receive',
                                id: transfer.id,
                              })
                            }
                            className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors'
                            title='Receive'
                          >
                            <PackageCheck className='h-3.5 w-3.5' />
                            Receive
                          </button>
                        )}
                        {transfer.status !== 'PENDING' &&
                          transfer.status !== 'APPROVED' && (
                            <span className='text-xs text-gray-400'>-</span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Approve/Receive Dialog */}
      {confirmAction && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setConfirmAction(null)}
          />
          <div className='relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              {confirmAction.type === 'approve'
                ? 'Approve Transfer'
                : 'Receive Asset'}
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              {confirmAction.type === 'approve'
                ? 'Are you sure you want to approve this transfer request?'
                : 'Confirm that you have received this asset?'}
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setConfirmAction(null)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmAction.type === 'approve'
                    ? handleApprove(confirmAction.id)
                    : handleReceive(confirmAction.id)
                }
                disabled={
                  approveMutation.isPending || receiveMutation.isPending
                }
                className='px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {approveMutation.isPending || receiveMutation.isPending
                  ? 'Processing...'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialogId !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => {
              setRejectDialogId(null);
              setRejectReason('');
            }}
          />
          <div className='relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Reject Transfer
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              Please provide a reason for rejecting this transfer request.
            </p>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Reason (optional)
              </label>
              <Input
                type='text'
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder='Enter rejection reason'
              />
            </div>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setRejectDialogId(null);
                  setRejectReason('');
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTransfersPage;
