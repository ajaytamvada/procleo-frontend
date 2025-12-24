import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  AlertCircle,
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

  const { data: allInvoices, isLoading: loading } = useAllInvoices();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (allInvoices) {
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

      setInvoices(filtered);
    }
  }, [allInvoices, selectedStatus, selectedType, searchTerm]);

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
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
        return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case InvoiceStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case InvoiceStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case InvoiceStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case InvoiceStatus.THREE_WAY_MATCHED:
        return 'bg-purple-100 text-purple-800';
      case InvoiceStatus.THREE_WAY_MISMATCH:
        return 'bg-orange-100 text-orange-800';
      case InvoiceStatus.PARTIALLY_PAID:
        return 'bg-indigo-100 text-indigo-800';
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate?: string, status?: InvoiceStatus) => {
    if (!dueDate || status === InvoiceStatus.PAID) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Invoices</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage supplier invoices and payments
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices/create')}
          className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
        >
          <Plus className='w-5 h-5 mr-2' />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Search invoice...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e =>
              setSelectedStatus(e.target.value as InvoiceStatus | '')
            }
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value=''>All Status</option>
            {Object.values(InvoiceStatus).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as InvoiceType | '')}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value=''>All Types</option>
            {Object.values(InvoiceType).map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className='flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
          >
            <Filter className='w-5 h-5 mr-2' />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Invoice Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Supplier
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Invoice Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Due Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Balance
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    Loading...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <FileText className='w-4 h-4 text-gray-400 mr-2' />
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {invoice.invoiceNumber}
                          </div>
                          {invoice.supplierInvoiceNumber && (
                            <div className='text-xs text-gray-500'>
                              Ref: {invoice.supplierInvoiceNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-900'>
                        {invoice.supplierName}
                      </div>
                      {invoice.poNumber && (
                        <div className='text-xs text-blue-600'>
                          PO: {invoice.poNumber}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {format(new Date(invoice.invoiceDate), 'dd/MM/yyyy')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center text-sm'>
                        {isOverdue(invoice.dueDate, invoice.status) && (
                          <AlertCircle className='w-4 h-4 text-red-500 mr-1' />
                        )}
                        <span
                          className={
                            isOverdue(invoice.dueDate, invoice.status)
                              ? 'text-red-600 font-medium'
                              : 'text-gray-900'
                          }
                        >
                          {invoice.dueDate
                            ? format(new Date(invoice.dueDate), 'dd/MM/yyyy')
                            : '-'}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          invoice.status
                        )}`}
                      >
                        {invoice.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ₹ {invoice.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm'>
                        <div className='text-gray-900'>
                          ₹{' '}
                          {invoice.balanceAmount?.toLocaleString('en-IN') ||
                            '0'}
                        </div>
                        {invoice.paidAmount && invoice.paidAmount > 0 && (
                          <div className='text-xs text-green-600'>
                            Paid: ₹ {invoice.paidAmount.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() =>
                            navigate(`/invoice/preview/${invoice.id}`)
                          }
                          className='text-blue-600 hover:text-blue-800 transition-colors'
                          title='View'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        {invoice.status === InvoiceStatus.DRAFT && (
                          <button
                            onClick={() =>
                              navigate(`/invoices/${invoice.id}/edit`)
                            }
                            className='text-gray-600 hover:text-gray-800 transition-colors'
                            title='Edit'
                          >
                            <Edit className='w-4 h-4' />
                          </button>
                        )}
                        {invoice.status === InvoiceStatus.PENDING_APPROVAL && (
                          <button
                            onClick={() => handleApprove(invoice.id!)}
                            className='text-green-600 hover:text-green-800 transition-colors'
                            title='Approve'
                          >
                            <CheckCircle className='w-4 h-4' />
                          </button>
                        )}
                        {invoice.status === InvoiceStatus.SUBMITTED &&
                          invoice.poNumber &&
                          invoice.grnNumber && (
                            <button
                              onClick={() => handleThreeWayMatch(invoice.id!)}
                              className='text-purple-600 hover:text-purple-800 transition-colors'
                              title='Three-way Match'
                            >
                              <FileText className='w-4 h-4' />
                            </button>
                          )}
                        {(invoice.status === InvoiceStatus.APPROVED ||
                          invoice.status === InvoiceStatus.THREE_WAY_MATCHED ||
                          invoice.status === InvoiceStatus.PARTIALLY_PAID) && (
                          <button
                            onClick={() => handleRecordPayment(invoice.id!)}
                            className='text-green-600 hover:text-green-800 transition-colors'
                            title='Record Payment'
                          >
                            <DollarSign className='w-4 h-4' />
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
      </div>
    </div>
  );
};

export default InvoiceListPage;
