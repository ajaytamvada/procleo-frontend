/**
 * All PO Page
 * Tabbed interface for Cancel PO, Short Close PO, and Amend PO
 */

import React, { useState } from 'react';
import { CancelPOTab } from '../components/CancelPOTab';
import { XCircle, MinusCircle, Edit3 } from 'lucide-react';

type TabType = 'cancel' | 'shortClose' | 'amend';

export const AllPOPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cancel');

  const tabs = [
    { id: 'cancel' as TabType, label: 'Cancel PO', icon: XCircle },
    { id: 'shortClose' as TabType, label: 'Short Close PO', icon: MinusCircle },
    { id: 'amend' as TabType, label: 'Amend PO', icon: Edit3 },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Purchase Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage purchase order operations including cancellation, short close, and amendments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'cancel' && <CancelPOTab />}
        {activeTab === 'shortClose' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MinusCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Short Close PO</h3>
              <p className="text-gray-600 max-w-md">
                Short close functionality for purchase orders coming soon...
              </p>
            </div>
          </div>
        )}
        {activeTab === 'amend' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Amend PO</h3>
              <p className="text-gray-600 max-w-md">
                Amendment functionality for purchase orders coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPOPage;
