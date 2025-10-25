import React, { useState } from 'react';
import { Download, X, Plus } from 'lucide-react';
import type { Budget } from '../../types';
import { useAllFinancialYears } from '../../hooks/useFinancialYearAPI';

interface BudgetListProps {
  budgets: Budget[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (budget: Budget) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (financialYearId?: number) => void;
}

const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCreate,
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  onFilterChange,
}) => {
  const [financialYearFilter, setFinancialYearFilter] = useState<string>('All');

  // Fetch financial years for filter dropdown
  const { data: financialYears = [], isLoading: loadingFinancialYears } = useAllFinancialYears();

  const handleFilterChange = (fyId: string) => {
    setFinancialYearFilter(fyId);
    if (onFilterChange) {
      if (fyId === 'All') {
        onFilterChange(undefined);
      } else {
        onFilterChange(Number(fyId));
      }
    }
  };

  const handleClear = () => {
    setFinancialYearFilter('All');
    if (onFilterChange) {
      onFilterChange(undefined);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = () => {
    // Create CSV
    const headers = ['S.No', 'Financial Year', 'Department', 'Department Code', 'Annual Budget'];
    const rows = budgets.map((budget, index) => [
      index + 1,
      budget.financialYearDisplay || '-',
      budget.departmentName || '-',
      budget.departmentId,
      budget.annualBudget,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading budgets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">
          Error loading budgets: {error.message}
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
            <h2 className="text-2xl font-bold text-gray-900">Budget</h2>
            <p className="text-sm text-gray-600 mt-1">Manage budget master records</p>
          </div>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            <Plus size={20} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={financialYearFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingFinancialYears}
          >
            <option value="All">All Financial Years</option>
            {financialYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                {fy.startDate} - {fy.endDate}
                {fy.activeYear === 1 ? ' (Active)' : ''}
              </option>
            ))}
          </select>
          <div></div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex-1"
            >
              <X size={18} />
              <span>Clear</span>
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={budgets.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                Department
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Annual Budget
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No budgets found. Click "New" to create one.
                </td>
              </tr>
            ) : (
              budgets.map((budget, index) => (
                <tr
                  key={budget.id}
                  onClick={() => onEdit(budget)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {currentPage * 15 + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {budget.financialYearDisplay || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{budget.departmentName || '-'}</div>
                      <div className="text-xs text-gray-600">Code: {budget.departmentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(budget.annualBudget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (budget.id) onDelete(budget.id);
                      }}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {startRecord}-{endRecord} of {totalElements} records
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetList;
