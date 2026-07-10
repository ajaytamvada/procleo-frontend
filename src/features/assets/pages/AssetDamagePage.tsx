import React, { useState, useMemo } from 'react';
import { AlertTriangle, Check, X, Search, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  usePendingDamage,
  useUnderRepair,
  useAllDamage,
  useApproveDamage,
  useRejectDamage,
  useCompleteRepair,
} from '../hooks/useAssets';
import type { AssetDamageReport, CompleteRepairRequest } from '../types';

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

const DAMAGE_STATUS_COLORS: Record<string, string> = {
  REPORTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REPAIR: 'bg-orange-100 text-orange-800',
  REPAIRED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IRREPARABLE: 'bg-rose-100 text-rose-800',
};

type TabFilter = 'PENDING' | 'UNDER_REPAIR' | 'ALL';

const DialogOverlay: React.FC<{
  onClose: () => void;
  children: React.ReactNode;
}> = ({ onClose, children }) => (
  <div
    className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4'
    onClick={onClose}
  >
    <div
      className='bg-white rounded-lg shadow-xl w-full max-w-md p-6'
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const AssetDamagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectFor, setRejectFor] = useState<number | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [completeFor, setCompleteFor] = useState<AssetDamageReport | null>(
    null
  );
  const [completeForm, setCompleteForm] = useState<CompleteRepairRequest>({
    resolution: 'REPAIRED',
    actualCost: undefined,
    repairVendor: '',
    remarks: '',
  });

  const { data: pending = [], isLoading: pendingLoading } = usePendingDamage();
  const { data: underRepair = [], isLoading: repairLoading } = useUnderRepair();
  const { data: all = [], isLoading: allLoading } = useAllDamage();

  const approveMutation = useApproveDamage();
  const rejectMutation = useRejectDamage();
  const completeMutation = useCompleteRepair();

  const source =
    activeTab === 'PENDING'
      ? pending
      : activeTab === 'UNDER_REPAIR'
        ? underRepair
        : all;
  const isLoading =
    activeTab === 'PENDING'
      ? pendingLoading
      : activeTab === 'UNDER_REPAIR'
        ? repairLoading
        : allLoading;

  const rows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (d: AssetDamageReport) =>
        d.assetTag?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.severity?.toLowerCase().includes(q) ||
        d.status?.toLowerCase().includes(q)
    );
  }, [source, searchTerm]);

  const submitReject = () => {
    if (rejectFor == null) return;
    rejectMutation.mutate(
      { id: rejectFor, data: { remarks: rejectRemarks } },
      {
        onSuccess: () => {
          setRejectFor(null);
          setRejectRemarks('');
        },
      }
    );
  };

  const submitComplete = () => {
    if (!completeFor) return;
    completeMutation.mutate(
      { id: completeFor.id, data: completeForm },
      {
        onSuccess: () => {
          setCompleteFor(null);
          setCompleteForm({
            resolution: 'REPAIRED',
            actualCost: undefined,
            repairVendor: '',
            remarks: '',
          });
        },
      }
    );
  };

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'PENDING', label: 'Pending Review', count: pending.length },
    { key: 'UNDER_REPAIR', label: 'Under Repair', count: underRepair.length },
    { key: 'ALL', label: 'All', count: all.length },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <AlertTriangle className='h-6 w-6 text-rose-500' />
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Damage &amp; Repair
          </h1>
          <p className='text-sm text-gray-500'>
            Review damage reports and manage repairs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-gray-200'>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className='relative max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
        <Input
          className='pl-9'
          placeholder='Search by tag, severity, description...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <p className='text-sm text-gray-500'>Loading...</p>
      ) : rows.length === 0 ? (
        <div className='text-center py-12 text-gray-400'>
          <AlertTriangle className='h-8 w-8 mx-auto mb-2' />
          <p>No damage reports.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {rows.map((d: AssetDamageReport) => (
            <div
              key={d.id}
              className='bg-white border border-gray-200 rounded-lg p-4'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='font-medium text-gray-900'>
                      {d.assetTag}
                    </span>
                    <Badge
                      className={
                        DAMAGE_STATUS_COLORS[d.status] ||
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {d.status}
                    </Badge>
                    <span className='text-xs text-gray-400'>{d.severity}</span>
                  </div>
                  {d.description && (
                    <p className='text-sm text-gray-600 mt-1'>
                      {d.description}
                    </p>
                  )}
                  {d.reportedIssue && (
                    <p className='text-xs text-gray-500 mt-0.5'>
                      Issue: {d.reportedIssue}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-1'>
                    Reported {formatDate(d.reportedDate)}
                    {d.reportedBy ? ` by ${d.reportedBy}` : ''}
                    {d.estimatedCost != null
                      ? ` · est. ${formatCurrency(d.estimatedCost)}`
                      : ''}
                  </p>
                </div>

                <div className='flex flex-col gap-2 shrink-0'>
                  {d.status === 'REPORTED' && (
                    <>
                      <button
                        onClick={() => approveMutation.mutate({ id: d.id })}
                        disabled={approveMutation.isPending}
                        className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50'
                      >
                        <Check className='h-3.5 w-3.5' />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectFor(d.id)}
                        className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100'
                      >
                        <X className='h-3.5 w-3.5' />
                        Reject
                      </button>
                    </>
                  )}
                  {d.status === 'UNDER_REPAIR' && (
                    <button
                      onClick={() => setCompleteFor(d)}
                      className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700'
                    >
                      <Wrench className='h-3.5 w-3.5' />
                      Complete Repair
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      {rejectFor != null && (
        <DialogOverlay onClose={() => setRejectFor(null)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Reject Repair
          </h3>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Reason
          </label>
          <Input
            value={rejectRemarks}
            onChange={e => setRejectRemarks(e.target.value)}
            placeholder='Why is the repair rejected?'
          />
          <p className='text-xs text-gray-400 mt-2'>
            The asset remains marked as damaged.
          </p>
          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={() => setRejectFor(null)}>
              Cancel
            </Button>
            <button
              onClick={submitReject}
              disabled={rejectMutation.isPending}
              className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50'
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </DialogOverlay>
      )}

      {/* Complete repair dialog */}
      {completeFor && (
        <DialogOverlay onClose={() => setCompleteFor(null)}>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            Complete Repair
          </h3>
          <p className='text-sm text-gray-500 mb-4'>{completeFor.assetTag}</p>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Resolution
              </label>
              <select
                value={completeForm.resolution}
                onChange={e =>
                  setCompleteForm(prev => ({
                    ...prev,
                    resolution: e.target
                      .value as CompleteRepairRequest['resolution'],
                  }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                <option value='REPAIRED'>Repaired — return to store</option>
                <option value='IRREPARABLE'>
                  Irreparable — flag for disposal
                </option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Actual Cost
              </label>
              <Input
                type='number'
                value={completeForm.actualCost ?? ''}
                onChange={e =>
                  setCompleteForm(prev => ({
                    ...prev,
                    actualCost: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder='Optional'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Repair Vendor
              </label>
              <Input
                value={completeForm.repairVendor || ''}
                onChange={e =>
                  setCompleteForm(prev => ({
                    ...prev,
                    repairVendor: e.target.value,
                  }))
                }
                placeholder='Optional'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Remarks
              </label>
              <Input
                value={completeForm.remarks || ''}
                onChange={e =>
                  setCompleteForm(prev => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                placeholder='Optional'
              />
            </div>
            <div className='flex justify-end gap-3 pt-2'>
              <Button variant='outline' onClick={() => setCompleteFor(null)}>
                Cancel
              </Button>
              <button
                onClick={submitComplete}
                disabled={completeMutation.isPending}
                className='px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50'
              >
                {completeMutation.isPending ? 'Saving...' : 'Complete'}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
};

export default AssetDamagePage;
