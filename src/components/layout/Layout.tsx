import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import DynamicSidebar from './DynamicSidebar';
import ErrorBoundary from '@/components/common/ErrorBoundary';

import { ChatWidget } from '@/components/chat/ChatWidget';
import AgentLauncher from '@/features/agent/components/AgentLauncher';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // The single AI assistant (merged from the old chatbot). The human "Need Help" chat's
  // Assistant button also opens this.
  const [agentOpen, setAgentOpen] = useState(false);
  const location = useLocation();

  // Any component can open the assistant by dispatching this event (e.g. the welcome banner).
  useEffect(() => {
    const open = () => setAgentOpen(true);
    window.addEventListener('procleo:open-agent', open);
    return () => window.removeEventListener('procleo:open-agent', open);
  }, []);

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

      {/* Global AI assistant — floating launcher + slide-over, on every authenticated page */}
      <AgentLauncher open={agentOpen} onOpenChange={setAgentOpen} />

      {/* Human-to-human chat "Need Help" launcher. Its Assistant button now opens the AI agent. */}
      <ChatWidget onOpenChatbot={() => setAgentOpen(true)} />
    </div>
  );
};

export default Layout;
