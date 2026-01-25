import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import DynamicSidebar from './DynamicSidebar';
import ErrorBoundary from '@/components/common/ErrorBoundary';

import { ChatbotWidget } from '@/features/chatbot/ChatbotWidget';
import { ChatWidget } from '@/components/chat/ChatWidget';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
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
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content area - Takes remaining height */}
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
        {/* Sidebar - Dynamic based on user permissions */}
        <DynamicSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
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
          <ErrorBoundary
            level='component'
            resetOnPropsChange={true}
            resetKeys={[location.pathname]}
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Chatbot Widget - Controlled by ChatWidget */}
      <ChatbotWidget
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />

      {/* Chat Widget with Need Help button - Opens both Chat and Chatbot */}
      <ChatWidget onOpenChatbot={() => setChatbotOpen(true)} />
    </div>
  );
};

export default Layout;
