import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  BarChart3,
  Filter,
  Search,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

// Import existing components
import { CreatePRPage, ManagePRPage, ApprovePRPage, PRStatusPage } from '../index';

type TabType = 'dashboard' | 'create-edit' | 'approval' | 'tracking';

interface PRStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const PurchaseRequisitionHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Mock data - replace with actual API calls
  const stats: PRStats = {
    total: 45,
    pending: 12,
    approved: 28,
    rejected: 5
  };

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Overview & Quick Actions'
    },
    {
      id: 'create-edit' as TabType,
      name: 'Create/Edit',
      icon: Plus,
      description: 'Create & Edit PRs'
    },
    {
      id: 'approval' as TabType,
      name: 'Approval',
      icon: CheckCircle,
      description: 'Approval Workflows'
    },
    {
      id: 'tracking' as TabType,
      name: 'Tracking',
      icon: ClipboardList,
      description: 'Status & History'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent stats={stats} />;
      case 'create-edit':
        return <CreatePRPage />;
      case 'approval':
        return <ApprovePRPage />;
      case 'tracking':
        return <PRStatusPage />;
      default:
        return <DashboardContent stats={stats} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardList size={24} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Requisition</h1>
              <p className="text-sm text-gray-600">Manage your procurement requests end-to-end</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus size={16} />
              <span>New PR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC<{ stats: PRStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PRs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ClipboardList size={24} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <AlertCircle size={24} className="text-orange-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <AlertCircle size={24} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus size={20} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Create New PR</p>
              <p className="text-sm text-gray-600">Start a new purchase requisition</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CheckCircle size={20} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Pending Approvals</p>
              <p className="text-sm text-gray-600">Review PRs awaiting approval</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 size={20} className="text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">PR performance insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent PRs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Purchase Requisitions</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search PRs..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PR ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Mock data - replace with actual data */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">PR-2024-001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Office Supplies Q1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">John Doe</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2024-01-15</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,500.00</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">PR-2024-002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">IT Equipment Upgrade</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Jane Smith</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2024-01-14</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$15,750.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequisitionHub;