import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import {
  queryClient,
  backgroundSync,
  persistenceUtils,
} from '@/lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    // Set up background sync
    const cleanupOnline = backgroundSync.syncOnOnline();
    const cleanupOffline = backgroundSync.pauseOnOffline();

    // Clear expired queries on startup
    persistenceUtils.clearExpiredQueries();

    // Set up periodic cleanup of expired queries
    const cleanupInterval = setInterval(
      () => {
        persistenceUtils.clearExpiredQueries();
      },
      60 * 60 * 1000
    ); // Every hour

    return () => {
      cleanupOnline();
      cleanupOffline();
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* Toast notifications for global feedback */}
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#14532d',
              border: '1px solid #22c55e',
              boxShadow:
                '0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f0fdf4',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#7f1d1d',
              border: '1px solid #ef4444',
              boxShadow:
                '0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
          },
          loading: {
            style: {
              background: '#eff6ff',
              color: '#1e3a8a',
              border: '1px solid #3b82f6',
              boxShadow:
                '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#eff6ff',
            },
          },
        }}
      />

      {/* Development tools */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition='bottom-left'
        />
      )}
    </QueryClientProvider>
  );
}
