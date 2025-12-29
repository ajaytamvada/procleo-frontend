import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  FileText,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { Invoice } from '../types';
import { InvoiceStatus, InvoiceType } from '../types';
import { format } from 'date-fns';
import { useAllInvoices } from '../hooks/useInvoice';

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | ''>('');
  const [selectedType, setSelectedType] = useState<InvoiceType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: allInvoices, isLoading: loading, refetch } = useAllInvoices();

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    if (!allInvoices) return [];

    let filtered = [...allInvoices];

    if (selectedStatus) {
      filtered = filtered.filter(inv => inv.status === selectedStatus);
    }

    if (selectedType) {
      filtered = filtered.filter(inv => inv.invoiceType === selectedType);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(lowerTerm) ||
          inv.supplierName.toLowerCase().includes(lowerTerm) ||
          (inv.poNumber && inv.poNumber.toLowerCase().includes(lowerTerm))
      );
    }

    return filtered;
  }, [allInvoices, selectedStatus, selectedType, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedType]);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleApprove = (id: number) => {
    if (window.confirm('Are you sure you want to approve this invoice?')) {
      console.log('Approving invoice:', id);
    }
  };

  const handleRecordPayment = (id: number) => {
    navigate(`/invoices/${id}/payment`);
  };

  const handleThreeWayMatch = (id: number) => {
    console.log('Performing three-way match for invoice:', id);
  };

  const getStatusBadgeClass = (status?: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case InvoiceStatus.SUBMITTED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case InvoiceStatus.PENDING_APPROVAL:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case InvoiceStatus.APPROVED:
        return 'bg-green-50 text-green-700 border-green-200';
      case InvoiceStatus.REJECTED:
        return 'bg-red-50 text-red-700 border-red-200';
      case InvoiceStatus.THREE_WAY_MATCHED:
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case InvoiceStatus.THREE_WAY_MISMATCH:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case InvoiceStatus.PAID:
        return 'bg-green-50 text-green-700 border-green-200';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const isOverdue = (dueDate?: string, status?: InvoiceStatus) => {
    if (!dueDate || status === InvoiceStatus.PAID) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Invoices</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage supplier invoices and payments
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices/create')}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Plus size={15} />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-4 mb-6'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search invoice...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          />
        </div>

        <div className='relative'>
          <select
            value={selectedStatus}
            onChange={e =>
              setSelectedStatus(e.target.value as InvoiceStatus | '')
            }
            className='w-48 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          >
            <option value=''>All Status</option>
            {Object.values(InvoiceStatus).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
        </div>

        <div className='relative'>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as InvoiceType | '')}
            className='w-44 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          >
            <option value=''>All Types</option>
            {Object.values(InvoiceType).map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
        </div>

        <button
          onClick={() => refetch()}
          className='inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors'
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Invoices Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#fafbfc]'>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Invoice Number
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Supplier
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Invoice Date
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Due Date
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Status
                </th>
                <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Amount
                </th>
                <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Balance
                </th>
                <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {loading ? (
                <tr>
                  <td colSpan={8} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                      <p className='text-sm text-gray-500 mt-3'>
                        Loading invoices...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                        <FileText className='w-6 h-6 text-gray-400' />
                      </div>
                      <p className='text-gray-600 font-medium'>
                        No invoices found
                      </p>
                      <p className='text-gray-400 text-sm mt-1'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <FileText size={14} className='text-gray-400' />
                        <div>
                          <button
                            onClick={() =>
                              navigate(`/invoice/preview/${invoice.id}`)
                            }
                            className='text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline'
                          >
                            {invoice.invoiceNumber}
                          </button>
                          {invoice.supplierInvoiceNumber && (
                            <p className='text-xs text-gray-500 mt-0.5'>
                              Ref: {invoice.supplierInvoiceNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <p className='text-sm text-gray-700'>
                          {invoice.supplierName}
                        </p>
                        {invoice.poNumber && (
                          <p className='text-xs text-violet-600 mt-0.5'>
                            PO: {invoice.poNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {format(new Date(invoice.invoiceDate), 'dd/MM/yyyy')}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-1 text-sm'>
                        {isOverdue(invoice.dueDate, invoice.status) && (
                          <AlertCircle size={14} className='text-red-500' />
                        )}
                        <span
                          className={
                            isOverdue(invoice.dueDate, invoice.status)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-600'
                          }
                        >
                          {invoice.dueDate
                            ? format(new Date(invoice.dueDate), 'dd/MM/yyyy')
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(invoice.status)}`}
                      >
                        {invoice.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-semibold text-gray-900'>
                      ₹
                      {invoice.grandTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='text-sm'>
                        <p className='text-gray-900 font-medium'>
                          ₹
                          {invoice.balanceAmount?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || '0.00'}
                        </p>
                        {invoice.paidAmount && invoice.paidAmount > 0 && (
                          <p className='text-xs text-green-600 mt-0.5'>
                            Paid: ₹
                            {invoice.paidAmount.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() =>
                            navigate(`/invoice/preview/${invoice.id}`)
                          }
                          className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title='View'
                        >
                          <Eye size={16} />
                        </button>
                        {invoice.status === InvoiceStatus.DRAFT && (
                          <button
                            onClick={() =>
                              navigate(`/invoices/${invoice.id}/edit`)
                            }
                            className='p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors'
                            title='Edit'
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {invoice.status === InvoiceStatus.PENDING_APPROVAL && (
                          <button
                            onClick={() => handleApprove(invoice.id!)}
                            className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                            title='Approve'
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {invoice.status === InvoiceStatus.SUBMITTED &&
                          invoice.poNumber &&
                          invoice.grnNumber && (
                            <button
                              onClick={() => handleThreeWayMatch(invoice.id!)}
                              className='p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors'
                              title='Three-way Match'
                            >
                              <FileText size={16} />
                            </button>
                          )}
                        {(invoice.status === InvoiceStatus.APPROVED ||
                          invoice.status === InvoiceStatus.THREE_WAY_MATCHED ||
                          invoice.status === InvoiceStatus.PARTIALLY_PAID) && (
                          <button
                            onClick={() => handleRecordPayment(invoice.id!)}
                            className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                            title='Record Payment'
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startIndex + 1}</span> to{' '}
              <span className='font-medium'>
                {Math.min(endIndex, filteredInvoices.length)}
              </span>{' '}
              of <span className='font-medium'>{filteredInvoices.length}</span>{' '}
              results
            </p>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>

              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
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
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
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

export default InvoiceListPage;
