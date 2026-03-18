import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Wrench, Check, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  usePendingMaintenance,
  useCompleteMaintenance,
} from '../hooks/useAssets';
import { cancelMaintenance } from '../api/assetsApi';
import type { AssetMaintenance } from '../types';

const formatCurrency = (amount?: number) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

type TabFilter = 'ALL' | 'PENDING' | 'COMPLETED';

const AssetMaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'complete' | 'cancel';
    id: number;
  } | null>(null);

  const queryClient = useQueryClient();
  const { data: pendingMaintenance = [], isLoading } = usePendingMaintenance();
  const completeMutation = useCompleteMaintenance();

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelMaintenance(id),
    onSuccess: () => {
      toast.success('Maintenance cancelled');
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to cancel maintenance'
      );
    },
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'ALL', label: 'All' },
  ];

  const filteredMaintenance = useMemo(() => {
    return pendingMaintenance.filter((m: AssetMaintenance) => {
      let matchesTab = true;
      if (activeTab === 'PENDING') {
        matchesTab = m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS';
      } else if (activeTab === 'COMPLETED') {
        matchesTab = m.status === 'COMPLETED' || m.status === 'CANCELLED';
      }

      const matchesSearch =
        !searchTerm ||
        m.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.maintenanceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [pendingMaintenance, activeTab, searchTerm]);

  const handleComplete = (id: number) => {
    completeMutation.mutate(id, {
      onSuccess: () => setConfirmAction(null),
    });
  };

  const handleCancel = (id: number) => {
    cancelMutation.mutate(id, {
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
          <Wrench className='h-5 w-5 text-violet-600' />
          Asset Maintenance
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Track and manage asset maintenance activities
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
          placeholder='Search by asset tag, type, description...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Table */}
      {filteredMaintenance.length === 0 ? (
        <div className='bg-white rounded-lg border border-gray-200 py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Wrench className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>
              No Maintenance Records Found
            </p>
            <p className='text-gray-400 text-sm mt-1'>
              No maintenance records match your criteria.
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
                    Asset Tag
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Maintenance Type
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Description
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Scheduled Date
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Cost
                  </th>
                  <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredMaintenance.map((maintenance: AssetMaintenance) => (
                  <tr
                    key={maintenance.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm font-medium text-violet-600'>
                        {maintenance.assetTag}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                      {maintenance.maintenanceType}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600 max-w-xs truncate'>
                      {maintenance.description || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {formatDate(maintenance.scheduledDate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <Badge
                        className={
                          MAINTENANCE_STATUS_COLORS[maintenance.status] ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {maintenance.status}
                      </Badge>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right'>
                      {formatCurrency(maintenance.cost)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        {maintenance.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'complete',
                                id: maintenance.id,
                              })
                            }
                            className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors'
                            title='Complete'
                          >
                            <Check className='h-3.5 w-3.5' />
                            Complete
                          </button>
                        )}
                        {maintenance.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: 'complete',
                                  id: maintenance.id,
                                })
                              }
                              className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors'
                              title='Complete'
                            >
                              <Check className='h-3.5 w-3.5' />
                              Complete
                            </button>
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: 'cancel',
                                  id: maintenance.id,
                                })
                              }
                              className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors'
                              title='Cancel'
                            >
                              <X className='h-3.5 w-3.5' />
                              Cancel
                            </button>
                          </>
                        )}
                        {maintenance.status !== 'IN_PROGRESS' &&
                          maintenance.status !== 'SCHEDULED' && (
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

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setConfirmAction(null)}
          />
          <div className='relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              {confirmAction.type === 'complete'
                ? 'Complete Maintenance'
                : 'Cancel Maintenance'}
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              {confirmAction.type === 'complete'
                ? 'Are you sure you want to mark this maintenance as completed?'
                : 'Are you sure you want to cancel this maintenance record?'}
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setConfirmAction(null)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Go Back
              </button>
              <button
                onClick={() =>
                  confirmAction.type === 'complete'
                    ? handleComplete(confirmAction.id)
                    : handleCancel(confirmAction.id)
                }
                disabled={
                  completeMutation.isPending || cancelMutation.isPending
                }
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  confirmAction.type === 'complete'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {completeMutation.isPending || cancelMutation.isPending
                  ? 'Processing...'
                  : confirmAction.type === 'complete'
                    ? 'Complete'
                    : 'Cancel Maintenance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetMaintenancePage;
