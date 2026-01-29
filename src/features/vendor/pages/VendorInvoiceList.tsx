import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Plus,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useVendorInvoices,
  VendorInvoice,
  downloadVendorInvoice,
} from '../hooks/useVendorInvoices';

const VendorInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { data: invoices, isLoading, error } = useVendorInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter invoices based on search and status
  const filteredInvoices =
    invoices?.filter(invoice => {
      const matchesSearch =
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.poNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = async (
    e: React.MouseEvent,
    invoice: VendorInvoice
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await downloadVendorInvoice(invoice.id, invoice.invoiceNumber);
    } catch (error) {
      alert('Failed to download invoice. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div>
            <h3 className='font-medium text-red-800'>Error Loading Invoices</h3>
            <p className='text-red-600 text-sm mt-1'>
              Unable to load your invoices. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Invoices</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage and track your submitted invoices
          </p>
        </div>
        <Link
          to='/vendor/orders'
          className='inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors'
        >
          <Plus className='w-4 h-4' />
          Create New Invoice
        </Link>
      </div>

      {/* Metrics Cards (Optional) */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white p-4 rounded-lg border shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <FileText className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Total Invoices</p>
              <p className='text-xl font-bold text-gray-900'>
                {invoices?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg border shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-yellow-50 rounded-lg'>
              <Calendar className='w-5 h-5 text-yellow-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Pending Payment</p>
              <p className='text-xl font-bold text-gray-900'>
                {invoices?.filter(i =>
                  ['SUBMITTED', 'APPROVED'].includes(i.status)
                ).length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg border shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-50 rounded-lg'>
              <DollarSign className='w-5 h-5 text-green-600' />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Paid (This Year)</p>
              <p className='text-xl font-bold text-gray-900'>
                {invoices?.filter(i => i.status === 'PAID').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg border p-4 flex flex-col md:flex-row gap-4'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search by Invoice # or PO #...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-500' />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='border rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          >
            <option value='ALL'>All Status</option>
            <option value='DRAFT'>Draft</option>
            <option value='SUBMITTED'>Submitted</option>
            <option value='APPROVED'>Approved</option>
            <option value='PAID'>Paid</option>
            <option value='REJECTED'>Rejected</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className='bg-white border rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 text-gray-600 font-medium border-b'>
              <tr>
                <th className='px-6 py-3'>Invoice Details</th>
                <th className='px-6 py-3'>PO Reference</th>
                <th className='px-6 py-3'>Date</th>
                <th className='px-6 py-3 text-right'>Amount</th>
                <th className='px-6 py-3 text-center'>Status</th>
                <th className='px-6 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='font-medium text-gray-900'>
                        {invoice.invoiceNumber}
                      </div>
                      <div className='text-xs text-gray-500 mt-0.5'>
                        ID: #{invoice.id}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <Link
                        to={`/vendor/orders/${invoice.poId}`}
                        className='text-violet-600 hover:underline'
                      >
                        {invoice.poNumber}
                      </Link>
                    </td>
                    <td className='px-6 py-4 text-gray-600'>
                      {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                    </td>
                    <td className='px-6 py-4 text-right font-medium text-gray-900'>
                      ₹
                      {invoice.totalAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={e => handleDownload(e, invoice)}
                          className='p-1.5 text-gray-400 hover:text-gray-600 transition-colors'
                          title='Download PDF'
                        >
                          <Download className='w-4 h-4' />
                        </button>
                        <Link
                          to={`/vendor/invoices/${invoice.id}`}
                          className='p-1.5 text-violet-600 hover:text-violet-700 transition-colors'
                          title='View Details'
                        >
                          <Eye className='w-4 h-4' />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                    <p className='text-lg font-medium text-gray-900'>
                      No invoices found
                    </p>
                    <p className='text-sm'>
                      {searchTerm || statusFilter !== 'ALL'
                        ? 'Try adjusting your search or filters.'
                        : "You haven't submitted any invoices yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoiceList;
