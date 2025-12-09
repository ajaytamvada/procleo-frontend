import React from 'react';
import { Outlet } from 'react-router-dom';
import MasterConfigurationMenu from './MasterConfigurationMenu';

const MasterConfigurationLayout: React.FC = () => {
  return (
    <div className='flex h-full bg-gray-50'>
      {/* Left Navigation Menu */}
      <MasterConfigurationMenu />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Master Configuration
              </h1>
              <p className='text-sm text-gray-600 mt-1'>
                Manage system configuration and reference data
              </p>
            </div>
            <div className='text-sm text-gray-500'>
              {/* You can add breadcrumbs or additional header actions here */}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className='flex-1 overflow-y-auto p-6'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MasterConfigurationLayout;
