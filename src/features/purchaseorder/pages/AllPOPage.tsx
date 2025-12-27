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
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold text-gray-800'>
          All Purchase Orders
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Manage purchase order operations including cancellation, short close,
          and amendments
        </p>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex gap-6' aria-label='Tabs'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative flex items-center gap-2 pb-3 px-1 font-medium text-sm transition-all duration-200
                  border-0 outline-none bg-transparent
                  ${
                    activeTab === tab.id
                      ? 'text-violet-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                />
                <span>{tab.label}</span>
                {/* Active/Hover/Focus indicator */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-violet-600'
                      : 'bg-transparent group-hover:bg-gray-300 group-focus:bg-violet-400'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'cancel' && <CancelPOTab />}
        {activeTab === 'shortClose' && (
          <div className='bg-white rounded-lg border border-gray-200 py-16'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4'>
                <MinusCircle className='w-7 h-7 text-violet-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Short Close PO
              </h3>
              <p className='text-gray-500 text-sm max-w-md mx-auto'>
                Short close functionality for purchase orders coming soon...
              </p>
            </div>
          </div>
        )}
        {activeTab === 'amend' && (
          <div className='bg-white rounded-lg border border-gray-200 py-16'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4'>
                <Edit3 className='w-7 h-7 text-violet-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Amend PO
              </h3>
              <p className='text-gray-500 text-sm max-w-md mx-auto'>
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
