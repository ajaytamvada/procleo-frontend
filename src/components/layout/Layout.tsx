import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      margin: '0 !important',
      padding: '0 !important',
      width: '100vw',
      maxWidth: '100vw',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header - Fixed height, no margins */}
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Main content area - Takes remaining height */}
      <div style={{
        display: 'flex',
        flex: 1,
        margin: '0 !important',
        padding: '0 !important',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content */}
        <main style={{
          flex: 1,
          margin: '0 !important',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          overflow: 'auto',
          width: '100%',
          maxWidth: '100%'
        }}>
          <ErrorBoundary 
            level="component"
            resetOnPropsChange={true}
            resetKeys={[location.pathname]}
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default Layout;