import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Search,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { useValuationTrail } from '../hooks/useAssets';
import { runDepreciation, type AssetValuationRow } from '../api/assetsApi';

const EVENT_STYLES: Record<string, string> = {
  ACQUISITION: 'bg-blue-50 text-blue-700 border-blue-200',
  DEPRECIATION: 'bg-amber-50 text-amber-700 border-amber-200',
  DISPOSAL: 'bg-red-50 text-red-700 border-red-200',
};

const formatMoney = (value: number | null) =>
  value == null
    ? '--'
    : `₹${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

/**
 * Asset Financial Trail — the numeric audit trail (value + depreciation over
 * time) backed by asset_valuation_history. The event-log style Audit Trail
 * (/assets/trail) is unchanged and complementary.
 */
const AssetFinancialTrailPage: React.FC = () => {
  const [assetTagFilter, setAssetTagFilter] = useState('');
  const [appliedTag, setAppliedTag] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const itemsPerPage = 15;
  const queryClient = useQueryClient();

  // Debounce the tag search so we don't query per keystroke
  useEffect(() => {
    const t = setTimeout(() => setAppliedTag(assetTagFilter), 400);
    return () => clearTimeout(t);
  }, [assetTagFilter]);

  const { data: rows, isLoading } = useValuationTrail(
    appliedTag || undefined,
    eventFilter || undefined
  );

  const filteredData = useMemo(() => rows ?? [], [rows]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedTag, eventFilter]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const handleExportToExcel = () => {
    if (!filteredData.length) {
      toast.error('No data to export');
      return;
    }
    const worksheetData = filteredData.map(
      (item: AssetValuationRow, index: number) => ({
        'S No.': index + 1,
        'Asset Tag': item.assetTag || '',
        Item: item.itemName || '',
        Event: item.eventType,
        Period: item.periodLabel || '',
        'Opening Value': item.openingValue ?? '',
        Depreciation: item.depreciationAmount ?? '',
        'Accumulated Depreciation': item.accumulatedDepreciation ?? '',
        'Closing NBV': item.closingValue ?? '',
        Method: item.depreciationMethod || '',
        Proceeds: item.proceeds ?? '',
        'Gain/Loss': item.gainLoss ?? '',
        Remarks: item.remarks || '',
        'Posted At': item.postedAt
          ? new Date(item.postedAt).toLocaleString('en-IN')
          : '',
      })
    );
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Trail');
    XLSX.writeFile(workbook, 'Asset_Financial_Trail.xlsx');
    toast.success('Report exported successfully');
  };

  const handleRunDepreciation = async () => {
    if (
      !window.confirm(
        'Run depreciation posting for all assets through last month? Already-posted months are skipped.'
      )
    ) {
      return;
    }
    setIsRunning(true);
    try {
      const result = await runDepreciation();
      toast.success(
        `Depreciation run complete: ${result.rowsPosted} row(s) posted through ${result.upTo}`
      );
      queryClient.invalidateQueries({ queryKey: ['asset-valuation'] });
    } catch (error) {
      toast.error('Depreciation run failed (admin permission required)');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Asset Financial Trail
          </h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Asset value and depreciation over time — acquisition, monthly
            depreciation postings and disposal
          </p>
        </div>
        <button
          onClick={handleRunDepreciation}
          disabled={isRunning}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 transition-colors'
        >
          <Play size={15} />
          {isRunning ? 'Running...' : 'Run Depreciation'}
        </button>
      </div>

      {/* Filters Card */}
      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Asset Tag
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                value={assetTagFilter}
                onChange={e => setAssetTagFilter(e.target.value)}
                placeholder='Search by asset tag...'
                className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Event
            </label>
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
              className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            >
              <option value=''>All Events</option>
              <option value='ACQUISITION'>Acquisition</option>
              <option value='DEPRECIATION'>Depreciation</option>
              <option value='DISPOSAL'>Disposal</option>
            </select>
          </div>
          <div className='flex items-end'>
            {filteredData.length > 0 && (
              <button
                onClick={handleExportToExcel}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors'
              >
                <Download size={15} />
                Export to Excel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trail Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading financial trail...
              </p>
            </div>
          ) : paginatedData.length > 0 ? (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Asset
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Event
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Period
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Opening
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Depreciation
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Accumulated
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Closing NBV
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Gain/Loss
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Posted
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {paginatedData.map(item => (
                  <tr
                    key={item.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {item.assetTag || '--'}
                      </span>
                      {item.itemName && (
                        <p className='text-xs text-gray-500 mt-0.5 max-w-[180px] truncate'>
                          {item.itemName}
                        </p>
                      )}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          EVENT_STYLES[item.eventType] ||
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {item.eventType.charAt(0) +
                          item.eventType.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap'>
                      {item.periodLabel || '--'}
                    </td>
                    <td className='px-4 py-3.5 text-right text-sm text-gray-700 whitespace-nowrap'>
                      {formatMoney(item.openingValue)}
                    </td>
                    <td className='px-4 py-3.5 text-right text-sm text-gray-700 whitespace-nowrap'>
                      {item.eventType === 'DEPRECIATION'
                        ? formatMoney(item.depreciationAmount)
                        : '--'}
                    </td>
                    <td className='px-4 py-3.5 text-right text-sm text-gray-700 whitespace-nowrap'>
                      {formatMoney(item.accumulatedDepreciation)}
                    </td>
                    <td className='px-4 py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap'>
                      {formatMoney(item.closingValue)}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right text-sm font-medium whitespace-nowrap ${
                        item.gainLoss == null
                          ? 'text-gray-400'
                          : item.gainLoss >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                      }`}
                    >
                      {item.gainLoss == null
                        ? '--'
                        : formatMoney(item.gainLoss)}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap'>
                      {item.postedAt
                        ? new Date(item.postedAt).toLocaleDateString('en-IN')
                        : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <TrendingDown className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>
                No valuation rows found
              </p>
              <p className='text-gray-400 text-sm mt-1'>
                {appliedTag || eventFilter
                  ? 'Try adjusting your filters'
                  : 'Run the depreciation posting to generate the trail'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startIndex + 1}</span> to{' '}
              <span className='font-medium'>
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span className='font-medium'>{filteredData.length}</span> rows
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              {getPageNumbers().map((page, idx) => (
                <React.Fragment key={idx}>
                  {page === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-violet-600 text-white border border-violet-600'
                          : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetFinancialTrailPage;
