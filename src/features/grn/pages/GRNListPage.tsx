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
  Package,
  FileText,
  Truck,
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

  useEffect(() => {
    fetchGRNs();
  }, [selectedStatus]);

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

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
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
        return 'bg-gray-100 text-gray-800';
      case GRNStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case GRNStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case GRNStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case GRNStatus.PARTIALLY_RECEIVED:
        return 'bg-orange-100 text-orange-800';
      case GRNStatus.FULLY_RECEIVED:
        return 'bg-blue-100 text-blue-800';
      case GRNStatus.QUALITY_CHECK_PENDING:
        return 'bg-purple-100 text-purple-800';
      case GRNStatus.QUALITY_CHECK_PASSED:
        return 'bg-green-100 text-green-800';
      case GRNStatus.QUALITY_CHECK_FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityBadgeClass = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Goods Receipt Notes
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage goods receipts and quality checks
          </p>
        </div>
        <button
          onClick={() => navigate('/grn/create')}
          className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
        >
          <Plus className='w-5 h-5 mr-2' />
          Create GRN
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Search GRN...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as GRNStatus | '')}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value=''>All Status</option>
            {Object.values(GRNStatus).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <input
            type='date'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            placeholder='Receipt Date'
          />

          <button
            onClick={handleSearch}
            className='flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
          >
            <Filter className='w-5 h-5 mr-2' />
            Apply Filters
          </button>
        </div>
      </div>

      {/* GRN Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  GRN Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  PO Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Supplier
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Receipt Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Quality Check
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Value
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
              ) : grns.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    No GRNs found
                  </td>
                </tr>
              ) : (
                grns.map(grn => (
                  <tr
                    key={grn.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <Package className='w-4 h-4 text-gray-400 mr-2' />
                        <div className='text-sm font-medium text-gray-900'>
                          {grn.grnNumber}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-blue-600 hover:text-blue-800 cursor-pointer'>
                        {grn.poNumber}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-900'>
                        {grn.supplierName}
                      </div>
                      {grn.deliveryChallanNumber && (
                        <div className='text-xs text-gray-500'>
                          DC: {grn.deliveryChallanNumber}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {format(new Date(grn.receivedDate), 'dd/MM/yyyy')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          grn.status
                        )}`}
                      >
                        {grn.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {grn.qualityCheckStatus && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityBadgeClass(
                            grn.qualityCheckStatus
                          )}`}
                        >
                          {grn.qualityCheckStatus}
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ₹ {grn.totalReceivedValue?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => navigate(`/grn/${grn.id}`)}
                          className='text-blue-600 hover:text-blue-800 transition-colors'
                          title='View'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        {grn.status === GRNStatus.DRAFT && (
                          <button
                            onClick={() => navigate(`/grn/${grn.id}/edit`)}
                            className='text-gray-600 hover:text-gray-800 transition-colors'
                            title='Edit'
                          >
                            <Edit className='w-4 h-4' />
                          </button>
                        )}
                        {grn.status === GRNStatus.PENDING_APPROVAL && (
                          <button
                            onClick={() => handleApprove(grn.id!)}
                            className='text-green-600 hover:text-green-800 transition-colors'
                            title='Approve'
                          >
                            <CheckCircle className='w-4 h-4' />
                          </button>
                        )}
                        {grn.status === GRNStatus.APPROVED &&
                          !grn.isInvoiceCreated && (
                            <button
                              onClick={() => handleCreateInvoice(grn.id!)}
                              className='text-purple-600 hover:text-purple-800 transition-colors'
                              title='Create Invoice'
                            >
                              <FileText className='w-4 h-4' />
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

export default GRNListPage;
