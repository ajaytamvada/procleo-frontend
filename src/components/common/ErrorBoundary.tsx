/**
 * Error Boundary Component
 *
 * A React error boundary that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

import { isDevelopment, getSentryConfig } from '@/utils/env';

// ========================================
// Types and Interfaces
// ========================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component';
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo;
  onReset: () => void;
  onReportError: () => void;
  level: 'page' | 'component';
  eventId: string | null;
}

// ========================================
// Error Display Component
// ========================================

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorInfo,
  onReset,
  onReportError,
  level,
  eventId,
}) => {
  const isPageLevel = level === 'page';

  const copyErrorToClipboard = async () => {
    const errorDetails = `
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
Event ID: ${eventId || 'N/A'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      alert('Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  if (isPageLevel) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='flex justify-center'>
            <AlertTriangle className='h-12 w-12 text-red-500' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Something went wrong
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            We apologize for the inconvenience. An unexpected error has
            occurred.
          </p>
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <div className='space-y-4'>
              <div className='flex flex-col space-y-3'>
                <button
                  onClick={onReset}
                  className='w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Try Again
                </button>

                <button
                  onClick={() => (window.location.href = '/')}
                  className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  <Home className='h-4 w-4 mr-2' />
                  Go Home
                </button>

                <button
                  onClick={onReportError}
                  className='w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  <Bug className='h-4 w-4 mr-2' />
                  Report Issue
                </button>
              </div>

              {isDevelopment && (
                <div className='mt-6 pt-6 border-t border-gray-200'>
                  <details className='cursor-pointer'>
                    <summary className='text-sm font-medium text-gray-700 hover:text-gray-900'>
                      Error Details (Development)
                    </summary>
                    <div className='mt-3 p-3 bg-red-50 rounded-md'>
                      <p className='text-xs font-medium text-red-800 mb-2'>
                        Error: {error.message}
                      </p>
                      <pre className='text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32'>
                        {error.stack}
                      </pre>
                      <button
                        onClick={copyErrorToClipboard}
                        className='mt-2 text-xs text-blue-600 hover:text-blue-800 underline'
                      >
                        Copy Error Details
                      </button>
                    </div>
                  </details>
                </div>
              )}

              {eventId && (
                <div className='mt-4 p-3 bg-gray-50 rounded-md'>
                  <p className='text-xs text-gray-600'>
                    Error ID: <span className='font-mono'>{eventId}</span>
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Reference this ID when reporting the issue.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Component-level error display
  return (
    <div className='border border-red-200 rounded-lg p-4 bg-red-50'>
      <div className='flex items-start'>
        <AlertTriangle className='h-5 w-5 text-red-400 mt-0.5' />
        <div className='ml-3 flex-1'>
          <h3 className='text-sm font-medium text-red-800'>Component Error</h3>
          <p className='text-sm text-red-700 mt-1'>
            This component encountered an error and could not be displayed.
          </p>
          <div className='mt-3 flex space-x-2'>
            <button
              onClick={onReset}
              className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200'
            >
              Retry
            </button>
            {isDevelopment && (
              <button
                onClick={copyErrorToClipboard}
                className='text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200'
              >
                Copy Error
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// Error Boundary Class Component
// ========================================

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;

    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to Sentry if configured
    let eventId: string | null = null;
    try {
      const sentryConfig = getSentryConfig();
      if (sentryConfig.enabled && window.Sentry) {
        eventId = window.Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
    }

    // Update state with error info and event ID
    this.setState({
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // Report to other monitoring services if needed
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys changed
    if (
      hasError &&
      resetOnPropsChange &&
      resetKeys &&
      resetKeys.some((key, index) => prevProps.resetKeys?.[index] !== key)
    ) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Additional error reporting can be added here
    // For example, sending to analytics, logging services, etc.

    try {
      // Example: Send to custom analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
        });
      }

      // Example: Send to custom logging service
      if (window.customLogger) {
        window.customLogger.error('React Error Boundary', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (reportError) {
      console.error(
        'Failed to report error to external services:',
        reportError
      );
    }
  };

  private resetErrorBoundary = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleReportError = () => {
    const { error, errorInfo, eventId } = this.state;

    if (!error) return;

    // Open email client with pre-filled error report
    const subject = encodeURIComponent('Error Report - Autovitica P2P');
    const body = encodeURIComponent(`
Please describe what you were doing when this error occurred:

[Your description here]

Technical Details:
- Error: ${error.message}
- Event ID: ${eventId || 'N/A'}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
- Browser: ${navigator.userAgent}

${
  isDevelopment
    ? `
Developer Information:
- Stack: ${error.stack}
- Component Stack: ${errorInfo?.componentStack}
`
    : ''
}
    `);

    window.open(
      `mailto:support@autovitica.com?subject=${subject}&body=${body}`
    );
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError && error && errorInfo) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error display
      return (
        <ErrorDisplay
          error={error}
          errorInfo={errorInfo}
          onReset={this.resetErrorBoundary}
          onReportError={this.handleReportError}
          level={level}
          eventId={eventId}
        />
      );
    }

    return children;
  }
}

// ========================================
// Functional Error Boundary Hook
// ========================================

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// ========================================
// Error Boundary Hook for Functional Components
// ========================================

export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Captured error:', error);
    setError(error);

    // Report to Sentry if available
    try {
      const sentryConfig = getSentryConfig();
      if (sentryConfig.enabled && window.Sentry) {
        window.Sentry.captureException(error);
      }
    } catch (sentryError) {
      console.error('Failed to report error to Sentry:', sentryError);
    }
  }, []);

  // Throw error to trigger error boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// ========================================
// Type Declarations for Global Variables
// ========================================

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: any) => string;
    };
    gtag?: (...args: any[]) => void;
    customLogger?: {
      error: (message: string, data: any) => void;
    };
  }
}

export default ErrorBoundary;
