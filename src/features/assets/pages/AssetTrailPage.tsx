import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  History,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAssetTrail, useTrailEventTypes } from '../hooks/useAssets';
import { getAssetTrailForExport } from '../api/assetsApi';
import { exportAssetTrailToExcel } from '../utils/exportAssetTrail';
import type { AssetHistory, AssetTrailFilters } from '../types';
import { ASSET_EVENT_COLORS, ASSET_EVENT_LABELS } from '../types';

const PAGE_SIZE = 25;

const EMPTY_FILTERS: AssetTrailFilters = {
  assetTag: '',
  eventType: '',
  performedBy: '',
  referenceNumber: '',
  fromDate: '',
  toDate: '',
};

const formatTimestamp = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const AssetTrailPage: React.FC = () => {
  const navigate = useNavigate();

  // `draft` is what the user is typing; `applied` is what we actually query with.
  // Splitting them keeps every keystroke from firing a request against a table
  // that grows without bound.
  const [draft, setDraft] = useState<AssetTrailFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<AssetTrailFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isFetching } = useAssetTrail(
    applied,
    currentPage,
    PAGE_SIZE
  );
  const { data: eventTypes = [] } = useTrailEventTypes();

  const events = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const hasActiveFilters = Object.values(applied).some(
    v => v !== '' && v != null
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setApplied(draft);
  };

  const handleClear = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setCurrentPage(0);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export the full filtered set, not just the page on screen.
      const rows = await getAssetTrailForExport(applied);
      if (rows.length === 0) {
        toast.error('Nothing to export for these filters');
        return;
      }
      const stamp = new Date().toISOString().split('T')[0];
      exportAssetTrailToExcel(rows, `asset-audit-trail-${stamp}.xlsx`);
      if (rows.length < totalElements) {
        toast(
          `Exported the first ${rows.length.toLocaleString()} of ${totalElements.toLocaleString()} rows. Narrow the date range for the rest.`,
          { icon: '⚠️', duration: 6000 }
        );
      } else {
        toast.success(`Exported ${rows.length.toLocaleString()} events`);
      }
    } catch {
      toast.error('Failed to export the audit trail');
    } finally {
      setIsExporting(false);
    }
  };

  const setField = (field: keyof AssetTrailFilters, value: string) =>
    setDraft(prev => ({ ...prev, [field]: value }));

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Asset Audit Trail
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Every recorded lifecycle event, across all assets
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || totalElements === 0}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isExporting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Download className='h-4 w-4' />
          )}
          <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
        </button>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className='bg-white rounded-lg border border-gray-200 p-4 space-y-4'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              Asset Tag
            </label>
            <Input
              type='text'
              placeholder='e.g. AST-000123'
              value={draft.assetTag || ''}
              onChange={e => setField('assetTag', e.target.value)}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              Event
            </label>
            <select
              value={draft.eventType || ''}
              onChange={e => setField('eventType', e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            >
              <option value=''>All Events</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {ASSET_EVENT_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              Performed By
            </label>
            <Input
              type='text'
              placeholder='Username'
              value={draft.performedBy || ''}
              onChange={e => setField('performedBy', e.target.value)}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              Reference No.
            </label>
            <Input
              type='text'
              placeholder='GRN / Transfer number'
              value={draft.referenceNumber || ''}
              onChange={e => setField('referenceNumber', e.target.value)}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              From Date
            </label>
            <Input
              type='date'
              value={draft.fromDate || ''}
              onChange={e => setField('fromDate', e.target.value)}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              To Date
            </label>
            <Input
              type='date'
              value={draft.toDate || ''}
              onChange={e => setField('toDate', e.target.value)}
            />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='submit'
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Search className='h-4 w-4' />
            <span>Search</span>
          </button>
          {hasActiveFilters && (
            <button
              type='button'
              onClick={handleClear}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
            >
              <X className='h-4 w-4' />
              <span>Clear</span>
            </button>
          )}
          {!isLoading && (
            <span className='ml-auto text-sm text-gray-500'>
              {totalElements.toLocaleString()} event
              {totalElements === 1 ? '' : 's'}
              {isFetching && ' · refreshing...'}
            </span>
          )}
        </div>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='flex flex-col items-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            <p className='text-sm text-gray-500 mt-3'>Loading...</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className='bg-white rounded-lg border border-gray-200 py-16'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <History className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-600 font-medium'>No Events Found</p>
            <p className='text-gray-400 text-sm mt-1'>
              {hasActiveFilters
                ? 'No trail entries match your filters.'
                : 'No asset lifecycle events have been recorded yet.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-[#F7F8FA]'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Date &amp; Time
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Asset Tag
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Event
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Status Change
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Performed By
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Reference
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {events.map((event: AssetHistory) => (
                    <tr
                      key={event.id}
                      className='hover:bg-gray-50 transition-colors cursor-pointer'
                      onClick={() => navigate(`/assets/view/${event.assetId}`)}
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {formatTimestamp(event.performedDate)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='text-sm font-medium text-violet-600'>
                          {event.assetTag || `#${event.assetId}`}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Badge
                          className={
                            ASSET_EVENT_COLORS[event.eventType] ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {ASSET_EVENT_LABELS[event.eventType] ||
                            event.eventType}
                        </Badge>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {event.fromStatus || event.toStatus ? (
                          <span>
                            {event.fromStatus || '—'}
                            <span className='mx-1.5 text-gray-400'>&rarr;</span>
                            {event.toStatus || '—'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {event.performedBy || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {event.referenceNumber ? (
                          <span>
                            {event.referenceNumber}
                            {event.referenceType && (
                              <span className='block text-xs text-gray-400'>
                                {event.referenceType}
                              </span>
                            )}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600 max-w-md truncate'>
                        {event.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center justify-between'>
              <p className='text-sm text-gray-600'>
                Showing{' '}
                <span className='font-medium'>
                  {currentPage * PAGE_SIZE + 1}
                </span>{' '}
                to{' '}
                <span className='font-medium'>
                  {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)}
                </span>{' '}
                of <span className='font-medium'>{totalElements}</span> events
              </p>

              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronLeft className='w-4 h-4' />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-violet-600 text-white border border-violet-600'
                          : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssetTrailPage;
