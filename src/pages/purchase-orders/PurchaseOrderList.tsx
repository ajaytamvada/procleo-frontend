import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

// Mock data for now to eliminate any API-related loops
const mockPurchaseOrders = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    vendor: { id: '1', name: 'ABC Suppliers Ltd.', email: 'contact@abc.com' },
    requester: { id: '1', name: 'John Doe', department: 'IT' },
    status: 'pending_approval' as const,
    grandTotal: 25000,
    currency: 'USD',
    items: [{ id: '1', description: 'Laptops', quantity: 5, unitPrice: 5000, totalPrice: 25000, category: 'Hardware' }],
    createdAt: '2024-01-15T10:00:00Z',
    expectedDelivery: '2024-02-15T10:00:00Z',
    priority: 'medium' as const,
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    vendor: { id: '2', name: 'XYZ Technologies', email: 'info@xyz.com' },
    requester: { id: '2', name: 'Jane Smith', department: 'Finance' },
    status: 'approved' as const,
    grandTotal: 15000,
    currency: 'USD',
    items: [{ id: '2', description: 'Software License', quantity: 1, unitPrice: 15000, totalPrice: 15000, category: 'Software' }],
    createdAt: '2024-01-10T10:00:00Z',
    expectedDelivery: '2024-02-10T10:00:00Z',
    priority: 'high' as const,
  },
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  received: { label: 'Received', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
  urgent: { label: 'Urgent', color: 'bg-red-200 text-red-800' },
};

export function PurchaseOrderList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const breadcrumbItems = [
    { label: 'Purchase Management', href: '/purchases' },
    { label: 'All Purchase Orders', isActive: true },
  ];

  // Simple stats calculation
  const stats = {
    total: mockPurchaseOrders.length,
    totalValue: mockPurchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0),
    avgValue: mockPurchaseOrders.length > 0 
      ? mockPurchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0) / mockPurchaseOrders.length 
      : 0,
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="page-container space-y-4">
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all purchase orders across different statuses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <FileText className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => navigate('/purchases/new')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Orders</p>
              <p className="stats-value">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Value</p>
              <p className="stats-value">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Average Value</p>
              <p className="stats-value">{formatCurrency(stats.avgValue)}</p>
            </div>
            <Building className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Simple Tabs */}
      <div className="card">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['all', 'pending', 'approved', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Orders
              </button>
            ))}
          </nav>
        </div>

        {/* Simple Table */}
        <div className="card-content p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">PO Number</th>
                  <th className="table-header-cell">Vendor</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Priority</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Requested By</th>
                  <th className="table-header-cell">Expected Delivery</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPurchaseOrders.map((po) => {
                  const StatusIcon = statusConfig[po.status].icon;
                  
                  return (
                    <tr key={po.id} className="table-row">
                      <td className="table-cell">
                        <div className="space-y-1">
                          <button
                            onClick={() => navigate(`/purchases/${po.id}`)}
                            className="font-medium text-blue-600 hover:text-blue-800 text-left"
                          >
                            {po.poNumber}
                          </button>
                          <div className="text-xs text-gray-500">
                            {formatDate(po.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          <div className="font-medium">{po.vendor.name}</div>
                          <div className="text-xs text-gray-500">{po.vendor.email}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusConfig[po.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[po.status].label}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${priorityConfig[po.priority].color}`}>
                          {priorityConfig[po.priority].label}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-right space-y-1">
                          <div className="font-medium">
                            {formatCurrency(po.grandTotal, po.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {po.items.length} item{po.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          <div className="font-medium">{po.requester.name}</div>
                          <div className="text-xs text-gray-500">{po.requester.department}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {po.expectedDelivery ? (
                          <div className="space-y-1">
                            <div>{formatDate(po.expectedDelivery)}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => navigate(`/purchases/${po.id}`)}
                            className="btn btn-ghost btn-sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/purchases/${po.id}/edit`)}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => console.log('Delete', po.id)}
                            className="btn btn-ghost btn-sm text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}