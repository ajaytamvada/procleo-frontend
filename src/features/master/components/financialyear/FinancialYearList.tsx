import React, { useState } from 'react';
import { Download, Search, X, Star, Edit2, Trash2 } from 'lucide-react';
import type { FinancialYear } from '../../types';

interface FinancialYearListProps {
  financialYears: FinancialYear[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (financialYear: FinancialYear) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onMakeCurrent: (id: number) => void;
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
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  onFilterChange,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    if (onFilterChange) {
      if (status === 'All') {
        onFilterChange(undefined);
      } else if (status === 'Active') {
        onFilterChange(1);
      } else {
        onFilterChange(0);
      }
    }
  };

  const handleClear = () => {
    setStatusFilter('All');
    if (onFilterChange) {
      onFilterChange(undefined);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleExport = () => {
    // Create CSV
    const headers = ['S.No', 'Start Date', 'End Date', 'First Half', 'Second Half', 'Status'];
    const rows = financialYears.map((fy, index) => [
      index + 1,
      formatDate(fy.startDate),
      formatDate(fy.endDate),
      `${formatDate(fy.firstHalfStartDate)} to ${formatDate(fy.firstHalfEndDate)}`,
      `${formatDate(fy.secondHalfStartDate)} to ${formatDate(fy.secondHalfEndDate)}`,
      fy.activeYear === 1 ? 'Active' : 'Inactive',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_years_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading financial years...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">
          Error loading financial years: {error.message}
        </div>
      </div>
    );
  }

  const startRecord = totalElements > 0 ? currentPage * 15 + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * 15, totalElements);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Year</h2>
            <p className="text-sm text-gray-600 mt-1">Manage financial year master records</p>
          </div>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
              <span>Clear</span>
            </button>
          </div>

          <div></div>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Financial Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                First Half
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Second Half
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {financialYears.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No financial years found. Click "New" to create one.
                </td>
              </tr>
            ) : (
              financialYears.map((fy, index) => (
                <tr
                  key={fy.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {startRecord + index}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatDate(fy.startDate)} - {formatDate(fy.endDate)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(fy.firstHalfStartDate)} - {formatDate(fy.firstHalfEndDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(fy.secondHalfStartDate)} - {formatDate(fy.secondHalfEndDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fy.activeYear === 1 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Star size={12} className="mr-1" fill="currentColor" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {fy.activeYear !== 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (fy.id) onMakeCurrent(fy.id);
                          }}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                          title="Make Current Year"
                        >
                          <Star size={14} className="mr-1" />
                          Make Current
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(fy);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fy.id && window.confirm('Are you sure you want to delete this financial year?')) {
                            onDelete(fy.id);
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startRecord}</span> to{' '}
              <span className="font-medium">{endRecord}</span> of{' '}
              <span className="font-medium">{totalElements}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialYearList;
