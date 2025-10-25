import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Send,
  MessageSquare,
  CheckCircle,
  Filter,
  Search,
  Clock,
  Users,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

// Import existing components
import { RFPListPage, CreateRFPFromPRPage } from '../index';

type TabType = 'dashboard' | 'create-float' | 'response-management' | 'approval-summary';

interface RFPStats {
  total: number;
  active: number;
  responses: number;
  completed: number;
}

const RFPActivityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Mock data - replace with actual API calls
  const stats: RFPStats = {
    total: 23,
    active: 8,
    responses: 45,
    completed: 15
  };

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: FileText,
      description: 'RFP Overview & Management'
    },
    {
      id: 'create-float' as TabType,
      name: 'Create & Float',
      icon: Plus,
      description: 'Create & Float RFPs'
    },
    {
      id: 'response-management' as TabType,
      name: 'Response Management',
      icon: MessageSquare,
      description: 'Handle Responses & Negotiations'
    },
    {
      id: 'approval-summary' as TabType,
      name: 'Approval & Summary',
      icon: CheckCircle,
      description: 'Final Approvals & Reports'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RFPDashboardContent stats={stats} />;
      case 'create-float':
        return <CreateRFPFromPRPage />;
      case 'response-management':
        return <ResponseManagementContent />;
      case 'approval-summary':
        return <ApprovalSummaryContent />;
      default:
        return <RFPDashboardContent stats={stats} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText size={24} className="text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RFP Activity</h1>
              <p className="text-sm text-gray-600">Manage Request for Proposal workflow from creation to completion</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('create-float')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Plus size={16} />
              <span>New RFP</span>
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
                    ? 'border-purple-500 text-purple-600'
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

// RFP Dashboard Content
const RFPDashboardContent: React.FC<{ stats: RFPStats }> = ({ stats }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RFPs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText size={24} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <Clock size={24} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Responses</p>
              <p className="text-3xl font-bold text-purple-600">{stats.responses}</p>
            </div>
            <MessageSquare size={24} className="text-purple-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>
      </div>

      {/* RFP Workflow Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">RFP Workflow Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Plus size={20} className="text-blue-600" />
            </div>
            <p className="font-medium text-gray-900">Create & Float</p>
            <p className="text-sm text-gray-600">3 RFPs</p>
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Send size={20} className="text-yellow-600" />
            </div>
            <p className="font-medium text-gray-900">Awaiting Response</p>
            <p className="text-sm text-gray-600">5 RFPs</p>
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare size={20} className="text-purple-600" />
            </div>
            <p className="font-medium text-gray-900">Under Review</p>
            <p className="text-sm text-gray-600">7 RFPs</p>
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <p className="font-medium text-gray-900">Approved</p>
            <p className="text-sm text-gray-600">8 RFPs</p>
          </div>
        </div>
      </div>

      {/* Recent RFPs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent RFP Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFPs..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFP ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">RFP-2024-001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">IT Infrastructure Upgrade</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">3/5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2024-01-30</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$50,000</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">RFP-2024-002</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Office Renovation</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Under Review
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">7/8</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2024-01-25</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$25,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Response Management Content
const ResponseManagementContent: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Management</h2>
        <p className="text-gray-600 mb-6">
          Manage RFP responses, conduct negotiations, handle re-submissions, and preview quotations.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Pending Responses</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium text-gray-900">RFP-2024-001</p>
                <p className="text-sm text-gray-600">IT Infrastructure - 3 responses</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>
                  <span className="text-xs text-gray-500">Due: 5 days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Negotiations</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium text-gray-900">RFP-2024-002</p>
                <p className="text-sm text-gray-600">Office Renovation - In negotiation</p>
                <div className="mt-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Negotiating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Ready for Review</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-medium text-gray-900">RFP-2024-003</p>
                <p className="text-sm text-gray-600">Marketing Services - Complete</p>
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Approval Summary Content
const ApprovalSummaryContent: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval & Summary</h2>
        <p className="text-gray-600 mb-6">
          Send RFPs for final approval and generate comprehensive summaries and reports.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Pending Approvals</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">RFP-2024-004</p>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Pending</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Catering Services - $15,000</p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Completed RFPs</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">RFP-2024-005</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Security Services - $30,000</p>
                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                  View Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFPActivityHub;