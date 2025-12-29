import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  Package,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { GRN } from '../../purchaseorder/types';
import { GRNStatus, GRNType } from '../../purchaseorder/types';
import { format } from 'date-fns';

const GRNListPage: React.FC = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<GRNStatus | ''>('');
  const [receiptDate, setReceiptDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockData: GRN[] = [
        {
          id: 1,
          grnNumber: 'GRN/2024-2025/001',
          poId: 1,
          poNumber: 'PO/2024-2025/001',
          poDate: '2024-09-08',
          supplierId: 1,
          supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
          receivedDate: '2024-09-15',
          receivedBy: 'Warehouse Manager',
          warehouseLocation: 'Main Warehouse - Section A',
          deliveryChallanNumber: 'DC/2024/1234',
          deliveryChallanDate: '2024-09-15',
          vehicleNumber: 'KA-01-AB-1234',
          transporterName: 'Fast Logistics',
          status: GRNStatus.APPROVED,
          grnType: GRNType.STANDARD,
          qualityCheckStatus: 'PASSED',
          totalReceivedValue: 496000,
          createdBy: 'John Doe',
          createdDate: '2024-09-15',
        },
        {
          id: 2,
          grnNumber: 'GRN/2024-2025/002',
          poId: 2,
          poNumber: 'PO/2024-2025/002',
          poDate: '2024-09-10',
          supplierId: 2,
          supplierName: 'KROMA PANTS PRIVATE LIMITED',
          receivedDate: '2024-09-16',
          receivedBy: 'Store Keeper',
          warehouseLocation: 'Secondary Warehouse',
          deliveryChallanNumber: 'DC/2024/1235',
          status: GRNStatus.QUALITY_CHECK_PENDING,
          grnType: GRNType.PARTIAL,
          totalReceivedValue: 125000,
          createdBy: 'Jane Smith',
          createdDate: '2024-09-16',
        },
      ];
      setGrns(mockData);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter GRNs
  const filteredGrns = useMemo(() => {
    let filtered = [...grns];

    if (selectedStatus) {
      filtered = filtered.filter(grn => grn.status === selectedStatus);
    }

    if (receiptDate) {
      filtered = filtered.filter(grn => grn.receivedDate === receiptDate);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        grn =>
          grn.grnNumber.toLowerCase().includes(lowerTerm) ||
          grn.poNumber?.toLowerCase().includes(lowerTerm) ||
          grn.supplierName.toLowerCase().includes(lowerTerm)
      );
    }

    return filtered;
  }, [grns, selectedStatus, receiptDate, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredGrns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGrns = filteredGrns.slice(startIndex, endIndex);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, receiptDate]);

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
    if (window.confirm('Are you sure you want to approve this GRN?')) {
      console.log('Approving GRN:', id);
    }
  };

  const handleCreateInvoice = (grnId: number) => {
    navigate(`/invoices/create?grnId=${grnId}`);
  };

  const getStatusBadgeClass = (status?: GRNStatus) => {
    switch (status) {
      case GRNStatus.DRAFT:
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case GRNStatus.PENDING_APPROVAL:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case GRNStatus.APPROVED:
        return 'bg-green-50 text-green-700 border-green-200';
      case GRNStatus.REJECTED:
        return 'bg-red-50 text-red-700 border-red-200';
      case GRNStatus.PARTIALLY_RECEIVED:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case GRNStatus.FULLY_RECEIVED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case GRNStatus.QUALITY_CHECK_PENDING:
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case GRNStatus.QUALITY_CHECK_PASSED:
        return 'bg-green-50 text-green-700 border-green-200';
      case GRNStatus.QUALITY_CHECK_FAILED:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getQualityBadgeClass = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            Goods Receipt Notes
          </h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage goods receipts and quality checks
          </p>
        </div>
        <button
          onClick={() => navigate('/grn/create')}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Plus size={15} />
          Create GRN
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-4 mb-6'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search GRN...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          />
        </div>

        <div className='relative'>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as GRNStatus | '')}
            className='w-48 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          >
            <option value=''>All Status</option>
            {Object.values(GRNStatus).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
        </div>

        <input
          type='date'
          value={receiptDate}
          onChange={e => setReceiptDate(e.target.value)}
          className='px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          placeholder='Receipt Date'
        />

        <button
          onClick={fetchGRNs}
          className='inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors'
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* GRN Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#fafbfc]'>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  GRN Number
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  PO Number
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Supplier
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Receipt Date
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Status
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Quality Check
                </th>
                <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                  Value
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
                        Loading GRNs...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedGrns.length === 0 ? (
                <tr>
                  <td colSpan={8} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                        <Package className='w-6 h-6 text-gray-400' />
                      </div>
                      <p className='text-gray-600 font-medium'>No GRNs found</p>
                      <p className='text-gray-400 text-sm mt-1'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedGrns.map(grn => (
                  <tr
                    key={grn.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <Package size={14} className='text-violet-600' />
                        </div>
                        <button
                          onClick={() => navigate(`/grn/preview/${grn.id}`)}
                          className='text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline'
                        >
                          {grn.grnNumber}
                        </button>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm font-medium text-violet-600'>
                        {grn.poNumber}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div>
                        <p className='text-sm text-gray-700'>
                          {grn.supplierName}
                        </p>
                        {grn.deliveryChallanNumber && (
                          <p className='text-xs text-gray-500 mt-0.5'>
                            DC: {grn.deliveryChallanNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {format(new Date(grn.receivedDate), 'dd/MM/yyyy')}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(grn.status)}`}
                      >
                        {grn.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      {grn.qualityCheckStatus && (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getQualityBadgeClass(grn.qualityCheckStatus)}`}
                        >
                          {grn.qualityCheckStatus}
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-semibold text-gray-900'>
                      ₹
                      {grn.totalReceivedValue?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => navigate(`/grn/preview/${grn.id}`)}
                          className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title='View'
                        >
                          <Eye size={16} />
                        </button>
                        {grn.status === GRNStatus.DRAFT && (
                          <button
                            onClick={() => navigate(`/grn/${grn.id}/edit`)}
                            className='p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors'
                            title='Edit'
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {grn.status === GRNStatus.PENDING_APPROVAL && (
                          <button
                            onClick={() => handleApprove(grn.id!)}
                            className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                            title='Approve'
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {grn.status === GRNStatus.APPROVED &&
                          !grn.isInvoiceCreated && (
                            <button
                              onClick={() => handleCreateInvoice(grn.id!)}
                              className='p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors'
                              title='Create Invoice'
                            >
                              <FileText size={16} />
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
                {Math.min(endIndex, filteredGrns.length)}
              </span>{' '}
              of <span className='font-medium'>{filteredGrns.length}</span>{' '}
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

export default GRNListPage;
