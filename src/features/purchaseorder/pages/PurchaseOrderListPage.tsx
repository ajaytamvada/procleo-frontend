import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { PurchaseOrder } from '../types';
import { POStatus } from '../types';
import { format } from 'date-fns';

const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<POStatus | ''>('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchPurchaseOrders();
  }, [selectedStatus, selectedType]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockData: PurchaseOrder[] = [
        {
          id: 1,
          poNumber: 'PO/2024-2025/001',
          rfpNumber: 'RFP2024/00001',
          supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
          supplierId: 1,
          poDate: '2024-09-08',
          deliveryDate: '2024-09-15',
          status: POStatus.APPROVED,
          grandTotal: 496000,
          createdBy: 'Wei',
          createdDate: '2024-09-08',
          department: 'Operations',
          paymentTerms: 'NETT 30 DAYS',
        },
        {
          id: 2,
          poNumber: 'PO/2024-2025/002',
          rfpNumber: 'RFP2024/00002',
          supplierName: 'KROMA PANTS PRIVATE LIMITED',
          supplierId: 2,
          poDate: '2024-09-07',
          deliveryDate: '2024-09-20',
          status: POStatus.DRAFT,
          grandTotal: 250000,
          createdBy: 'Admin',
          createdDate: '2024-09-07',
          department: 'IT',
          paymentTerms: 'NETT 45 DAYS',
        },
      ];
      setPurchaseOrders(mockData);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching for:', searchTerm);
  };

  const handleDelete = (id: number) => {
    if (
      window.confirm('Are you sure you want to delete this Purchase Order?')
    ) {
      // Implement delete logic
      console.log('Deleting PO:', id);
    }
  };

  const handleCreateGRN = (poId: number) => {
    navigate(`/grn/create?poId=${poId}`);
  };

  const handleCreateInvoice = (poId: number) => {
    navigate(`/invoices/create?poId=${poId}`);
  };

  const getStatusBadgeClass = (status?: POStatus) => {
    switch (status) {
      case POStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case POStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case POStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case POStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case POStatus.PARTIALLY_DELIVERED:
        return 'bg-yellow-100 text-yellow-800';
      case POStatus.DELIVERED:
        return 'bg-purple-100 text-purple-800';
      case POStatus.INVOICED:
        return 'bg-indigo-100 text-indigo-800';
      case POStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Purchase Orders</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage purchase orders and track deliveries
          </p>
        </div>
        <button
          onClick={() => navigate('/purchase-orders/create')}
          className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
        >
          <Plus className='w-5 h-5 mr-2' />
          Create PO
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Search PO...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as POStatus | '')}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value=''>All Status</option>
            {Object.values(POStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value=''>All Types</option>
            <option value='DIRECT'>Direct PO</option>
            <option value='INDIRECT'>Indirect PO</option>
            <option value='SERVICE'>Service PO</option>
            <option value='CAPEX'>CAPEX</option>
            <option value='OPEX'>OPEX</option>
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

      {/* Purchase Orders Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  PO Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  RFP Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Supplier Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  PO Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Delivery Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Amount
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
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-4 text-center text-gray-500'
                  >
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                purchaseOrders.map(po => (
                  <tr
                    key={po.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {po.poNumber}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-blue-600 hover:text-blue-800 cursor-pointer'>
                        {po.rfpNumber || '-'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {po.supplierName}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {format(new Date(po.poDate), 'dd/MM/yyyy')}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {po.deliveryDate
                        ? format(new Date(po.deliveryDate), 'dd/MM/yyyy')
                        : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          po.status
                        )}`}
                      >
                        {po.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ₹ {po.grandTotal?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          className='text-blue-600 hover:text-blue-800 transition-colors'
                          title='View'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        {po.status === POStatus.DRAFT && (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/purchase-orders/${po.id}/edit`)
                              }
                              className='text-gray-600 hover:text-gray-800 transition-colors'
                              title='Edit'
                            >
                              <Edit className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => handleDelete(po.id!)}
                              className='text-red-600 hover:text-red-800 transition-colors'
                              title='Delete'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </>
                        )}
                        {po.status === POStatus.APPROVED &&
                          !po.isGrnCreated && (
                            <button
                              onClick={() => handleCreateGRN(po.id!)}
                              className='text-purple-600 hover:text-purple-800 transition-colors'
                              title='Create GRN'
                            >
                              <Package className='w-4 h-4' />
                            </button>
                          )}
                        {po.status === POStatus.DELIVERED &&
                          !po.isInvoiceCreated && (
                            <button
                              onClick={() => handleCreateInvoice(po.id!)}
                              className='text-green-600 hover:text-green-800 transition-colors'
                              title='Create Invoice'
                            >
                              <FileText className='w-4 h-4' />
                            </button>
                          )}
                        <button
                          className='text-gray-600 hover:text-gray-800 transition-colors'
                          title='Download'
                        >
                          <Download className='w-4 h-4' />
                        </button>
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

export default PurchaseOrderListPage;
