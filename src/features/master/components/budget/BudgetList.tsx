import React, { useState } from 'react';
import {
  Download,
  Upload,
  X,
  Plus,
  Trash2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  History,
  Eye,
} from 'lucide-react';
import type { Budget, BudgetTransaction } from '../../types';
import { useAllFinancialYears } from '../../hooks/useFinancialYearAPI';
import { useBudgetTransactions } from '../../hooks/useBudgetAPI';

interface BudgetListProps {
  budgets: Budget[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (budget: Budget) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onImport: () => void;
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (fyId?: number) => void;
}

const TransactionHistoryModal: React.FC<{
  budget: Budget;
  onClose: () => void;
}> = ({ budget, onClose }) => {
  const { data: transactions = [], isLoading } = useBudgetTransactions(
    budget.id || 0
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col'>
        <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900'>
              Transaction History
            </h2>
            <p className='text-sm text-gray-500'>
              {budget.departmentName} | {budget.financialYearDisplay}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-auto p-6'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              No transactions found for this budget.
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  <th className='pb-3'>Date</th>
                  <th className='pb-3'>Type</th>
                  <th className='pb-3'>Reference</th>
                  <th className='pb-3 text-right'>Amount</th>
                  <th className='pb-3'>Movement</th>
                  <th className='pb-3'>User</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {transactions.map((txn, idx) => (
                  <tr key={idx} className='text-sm'>
                    <td className='py-3 text-gray-600'>
                      {txn.createdDate
                        ? new Date(txn.createdDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className='py-3 font-medium text-gray-900'>
                      {txn.txnType}
                    </td>
                    <td className='py-3'>
                      <div className='text-gray-900'>{txn.refType}</div>
                      <div className='text-xs text-gray-400'>
                        {txn.refNumber || '-'}
                      </div>
                    </td>
                    <td className='py-3 text-right font-medium text-gray-900'>
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className='py-3'>
                      <div className='text-xs flex items-center gap-1.5'>
                        <span className='px-1.5 py-0.5 bg-gray-100 rounded text-gray-600'>
                          {txn.bucketFrom || 'N/A'}
                        </span>
                        <ChevronRight size={12} className='text-gray-400' />
                        <span className='px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded font-medium'>
                          {txn.bucketTo || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className='py-3 text-gray-600'>{txn.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCreate,
  onImport,
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  onFilterChange,
}) => {
  const [fyFilter, setFyFilter] = useState<string>('All');
  const [historyBudget, setHistoryBudget] = useState<Budget | null>(null);
  const { data: financialYears = [], isLoading: loadingFY } =
    useAllFinancialYears();
  const pageSize = 20;

  const handleFilterChange = (fyId: string) => {
    setFyFilter(fyId);
    onFilterChange?.(fyId === 'All' ? undefined : Number(fyId));
  };

  const formatCurrency = (amount: number = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const handleExport = () => {
    const headers = [
      'S.No',
      'Financial Year',
      'Department',
      'Department Code',
      'Annual Budget',
      'Pending',
      'Committed',
      'Utilized',
      'Available',
    ];
    const rows = budgets.map((b, i) => [
      i + 1,
      b.financialYearDisplay || '-',
      b.departmentName || '-',
      b.departmentId,
      b.annualBudget,
      b.pendingAmount || 0,
      b.committedAmount || 0,
      b.utilizedAmount || 0,
      b.availableAmount || 0,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `budgets_${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className='text-red-600 font-medium'>Error loading budgets</p>
          <p className='text-gray-500 text-sm mt-1'>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Budget</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage and track budget utilization
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={onImport}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100'
          >
            <Upload size={15} />
            Import
          </button>
          <button
            onClick={onCreate}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 shadow-sm'
          >
            <Plus size={15} />
            New Budget
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <select
              value={fyFilter}
              onChange={e => handleFilterChange(e.target.value)}
              disabled={loadingFY}
              className='px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-w-[200px]'
            >
              <option value='All'>All Financial Years</option>
              {financialYears.map(fy => (
                <option key={fy.id} value={fy.id}>
                  {fy.startDate} - {fy.endDate}
                  {fy.activeYear === 1 ? ' (Active)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleFilterChange('All')}
              className='p-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              title='Clear Filters'
            >
              <X size={18} />
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={budgets.length === 0}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors'
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>Loading budgets...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Wallet className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No budgets found</p>
              <p className='text-gray-400 text-sm mt-1'>
                Click "New Budget" to create one
              </p>
            </div>
          ) : (
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-50/50 border-b border-gray-200'>
                  <th className='px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-12'>
                    #
                  </th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    Department
                  </th>
                  <th className='px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    FY
                  </th>
                  <th className='px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    Allocated
                  </th>
                  <th className='px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/30'>
                    Pending
                  </th>
                  <th className='px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-orange-50/30'>
                    Committed
                  </th>
                  <th className='px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-green-50/30'>
                    Utilized
                  </th>
                  <th className='px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider font-bold text-violet-700'>
                    Available
                  </th>
                  <th className='px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {budgets.map((b, idx) => {
                  const availablePercentage =
                    b.availableAmount !== undefined && b.annualBudget > 0
                      ? (b.availableAmount / b.annualBudget) * 100
                      : 100;

                  return (
                    <tr
                      key={b.id}
                      className='hover:bg-gray-50 transition-colors group'
                    >
                      <td className='px-4 py-4 text-center text-sm text-gray-500 font-medium'>
                        {currentPage * pageSize + idx + 1}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors'>
                          {b.departmentName || '-'}
                        </div>
                        <div className='text-[10px] font-mono text-gray-400 mt-0.5 px-1 bg-gray-50 w-fit rounded'>
                          {b.departmentId}
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <span className='px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded-full uppercase border border-violet-100'>
                          {b.financialYearDisplay || '-'}
                        </span>
                      </td>
                      <td className='px-4 py-4 text-right text-sm font-medium text-gray-900'>
                        {formatCurrency(b.annualBudget)}
                      </td>
                      <td className='px-4 py-4 text-right text-sm font-medium text-blue-600 bg-blue-50/10'>
                        {formatCurrency(b.pendingAmount)}
                      </td>
                      <td className='px-4 py-4 text-right text-sm font-medium text-orange-600 bg-orange-50/10'>
                        {formatCurrency(b.committedAmount)}
                      </td>
                      <td className='px-4 py-4 text-right text-sm font-medium text-green-600 bg-green-50/10'>
                        {formatCurrency(b.utilizedAmount)}
                      </td>
                      <td className='px-4 py-4 text-right'>
                        <div
                          className={`text-sm font-bold ${availablePercentage < 10 ? 'text-red-600' : availablePercentage < 25 ? 'text-orange-600' : 'text-violet-700'}`}
                        >
                          {formatCurrency(b.availableAmount)}
                        </div>
                        <div className='w-full bg-gray-100 h-1 rounded-full mt-1.5 overflow-hidden'>
                          <div
                            className={`h-full rounded-full ${availablePercentage < 10 ? 'bg-red-500' : availablePercentage < 25 ? 'bg-orange-500' : 'bg-violet-600'}`}
                            style={{
                              width: `${Math.max(0, Math.min(100, availablePercentage))}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className='px-4 py-4 text-center'>
                        <div className='flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <button
                            onClick={() => setHistoryBudget(b)}
                            className='p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                            title='Transaction History'
                          >
                            <History size={16} />
                          </button>
                          <button
                            onClick={() => onEdit(b)}
                            className='p-1.5 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors'
                            title='Edit/Revise'
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (b.id) onDelete(b.id);
                            }}
                            className='p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title='Delete'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 0 && !isLoading && budgets.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30'>
            <p className='text-xs text-gray-500 font-medium'>
              Showing <span className='text-gray-900'>{startRecord}</span> to{' '}
              <span className='text-gray-900'>{endRecord}</span> of{' '}
              <span className='text-gray-900'>{totalElements}</span> entries
            </p>
            <div className='flex items-center gap-1.5'>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <div className='flex items-center gap-1'>
                {getPageNumbers().map((p, i) => (
                  <React.Fragment key={i}>
                    {p === '...' ? (
                      <span className='px-2 text-gray-400 font-medium'>
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => onPageChange(p as number)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                          currentPage === p
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                            : 'text-gray-600 hover:bg-white hover:border-gray-300 border border-transparent'
                        }`}
                      >
                        {(p as number) + 1}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {historyBudget && (
        <TransactionHistoryModal
          budget={historyBudget}
          onClose={() => setHistoryBudget(null)}
        />
      )}
    </div>
  );
};

export default BudgetList;
