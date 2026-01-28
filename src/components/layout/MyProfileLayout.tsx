import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import MyProfile from '@/pages/MyProfile';

const MyProfileLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 !important',
        padding: '0 !important',
        width: '100vw',
        maxWidth: '100vw',
        backgroundColor: '#f8f9fa',
      }}
    >
      {/* Header - Fixed height, no margins */}
      <Header onMenuClick={() => {}} />

      {/* Main content area - Takes remaining height, NO SIDEBAR */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          margin: '0 !important',
          padding: '0 !important',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Main content - Full width without sidebar */}
        <main
          style={{
            flex: 1,
            margin: '0 !important',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            overflow: 'auto',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <MyProfile />
        </main>
      </div>
    </div>
  );
};

export default MyProfileLayout;
