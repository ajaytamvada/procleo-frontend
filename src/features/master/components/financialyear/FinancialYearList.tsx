import React, { useState } from 'react';
import {
  Download,
  Upload,
  X,
  Plus,
  Trash2,
  Calendar,
  Star,
  Edit2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { FinancialYear } from '../../types';

interface FinancialYearListProps {
  financialYears: FinancialYear[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (fy: FinancialYear) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onMakeCurrent: (id: number) => void;
  onImport: () => void;
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (activeYear?: number) => void;
}

const FinancialYearList: React.FC<FinancialYearListProps> = ({
  financialYears,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCreate,
  onMakeCurrent,
  onImport,
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  onFilterChange,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const pageSize = 15;

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    onFilterChange?.(
      status === 'All' ? undefined : status === 'Active' ? 1 : 0
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    const headers = [
      'S.No',
      'Start Date',
      'End Date',
      'First Half',
      'Second Half',
      'Status',
    ];
    const rows = financialYears.map((fy, i) => [
      i + 1,
      formatDate(fy.startDate),
      formatDate(fy.endDate),
      `${formatDate(fy.firstHalfStartDate)} to ${formatDate(fy.firstHalfEndDate)}`,
      `${formatDate(fy.secondHalfStartDate)} to ${formatDate(fy.secondHalfEndDate)}`,
      fy.activeYear === 1 ? 'Active' : 'Inactive',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `financial_years_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      )
        if (!pages.includes(i)) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  };

  const startRecord = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  if (error) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-2'>
        <div className='flex flex-col items-center justify-center py-16'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3'>
            <AlertCircle className='w-6 h-6 text-red-500' />
          </div>
          <p className='text-red-600 font-medium'>
            Error loading financial years
          </p>
          <p className='text-gray-500 text-sm mt-1'>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Financial Year
          </h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage financial year master records
          </p>
        </div>
        <button
          onClick={onCreate}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700'
        >
          <Plus size={15} />
          New Financial Year
        </button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <select
            value={statusFilter}
            onChange={e => handleFilterChange(e.target.value)}
            className='px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
          >
            <option value='All'>All Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
          </select>
          <div className='flex gap-2'>
            <button
              onClick={() => handleFilterChange('All')}
              className='p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
            >
              <X size={18} />
            </button>
          </div>
          <div></div>
          <button
            onClick={onImport}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100'
          >
            <Upload size={15} />
            Import
          </button>
          <button
            onClick={handleExport}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700'
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading financial years...
              </p>
            </div>
          ) : financialYears.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Calendar className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>
                No financial years found
              </p>
              <p className='text-gray-400 text-sm mt-1'>
                Click "New Financial Year" to create one
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-16'>
                    S.No
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Financial Year
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    First Half
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Second Half
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Status
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-40'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {financialYears.map((fy, idx) => (
                  <tr
                    key={fy.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {startRecord + idx}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {formatDate(fy.startDate)} - {formatDate(fy.endDate)}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {formatDate(fy.firstHalfStartDate)} -{' '}
                      {formatDate(fy.firstHalfEndDate)}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {formatDate(fy.secondHalfStartDate)} -{' '}
                      {formatDate(fy.secondHalfEndDate)}
                    </td>
                    <td className='px-4 py-3.5'>
                      {fy.activeYear === 1 ? (
                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
                          <Star size={12} fill='currentColor' />
                          Active
                        </span>
                      ) : (
                        <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        {fy.activeYear !== 1 && (
                          <button
                            onClick={() => fy.id && onMakeCurrent(fy.id)}
                            className='inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100'
                          >
                            <Star size={12} />
                            Make Current
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(fy)}
                          className='p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg'
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            fy.id &&
                            window.confirm('Delete this financial year?') &&
                            onDelete(fy.id)
                          }
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 0 && !isLoading && financialYears.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startRecord}</span> to{' '}
              <span className='font-medium'>{endRecord}</span> of{' '}
              <span className='font-medium'>{totalElements}</span> results
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              {getPageNumbers().map((p, i) => (
                <React.Fragment key={i}>
                  {p === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                  ) : (
                    <button
                      onClick={() => onPageChange(p as number)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium ${currentPage === p ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {(p as number) + 1}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40'
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

export default FinancialYearList;
