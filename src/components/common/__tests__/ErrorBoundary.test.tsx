/**
 * Test suite for ErrorBoundary component
 */

import React from 'react';
import { render, screen, fireEvent } from '@/test/utils/test-utils';

import ErrorBoundary, {
  withErrorBoundary,
  useErrorHandler,
} from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = true,
}) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Component to test useErrorHandler hook
const TestErrorHandler: React.FC = () => {
  const { captureError } = useErrorHandler();

  const handleClick = () => {
    captureError(new Error('Hook error'));
  };

  return <button onClick={handleClick}>Trigger Error</button>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('Component-level error boundary', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should display component-level error UI when error occurs', () => {
      render(
        <ErrorBoundary level='component'>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This component encountered an error and could not be displayed.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should reset error state when retry button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary level='component'>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();

      // Mock the component to not throw error after retry
      rerender(
        <ErrorBoundary level='component'>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Retry'));

      expect(screen.queryByText('Component Error')).not.toBeInTheDocument();
    });
  });

  describe('Page-level error boundary', () => {
    it('should display page-level error UI when error occurs', () => {
      render(
        <ErrorBoundary level='page'>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(
          'We apologize for the inconvenience. An unexpected error has occurred.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
      expect(screen.getByText('Report Issue')).toBeInTheDocument();
    });

    it('should show error details in development mode', () => {
      // Mock development enjestronment
      const originalEnv = import.meta.env;
      jest.mocked(import.meta.env).DEV = true;

      render(
        <ErrorBoundary level='page'>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(
        screen.getByText('Error Details (Development)')
      ).toBeInTheDocument();

      // Restore enjestronment
      Object.assign(import.meta.env, originalEnv);
    });

    it('should call custom error handler when projestded', () => {
      const mockErrorHandler = jest.fn();

      render(
        <ErrorBoundary onError={mockErrorHandler}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Custom fallback UI', () => {
    it('should render custom fallback when projestded', () => {
      const customFallback = <div>Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByText('Component Error')).not.toBeInTheDocument();
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('should wrap component with error boundary', () => {
      const TestComponent = () => <div>Test Component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        level: 'component',
      });

      render(<WrappedComponent />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('should catch errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ThrowError, {
        level: 'component',
      });

      render(<WrappedComponent />);

      expect(screen.getByText('Component Error')).toBeInTheDocument();
    });

    it('should set correct display name', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';

      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe(
        'withErrorBoundary(TestComponent)'
      );
    });
  });

  describe('useErrorHandler hook', () => {
    it('should projestde error capture function', () => {
      render(
        <ErrorBoundary>
          <TestErrorHandler />
        </ErrorBoundary>
      );

      expect(screen.getByText('Trigger Error')).toBeInTheDocument();
    });

    it('should trigger error boundary when captureError is called', () => {
      render(
        <ErrorBoundary level='component'>
          <TestErrorHandler />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Trigger Error'));

      expect(screen.getByText('Component Error')).toBeInTheDocument();
    });
  });

  describe('Error reporting', () => {
    it('should open mailto link when report error is clicked', () => {
      // Mock window.open
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      render(
        <ErrorBoundary level='page'>
          <ThrowError />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Report Issue'));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('mailto:support@autojesttica.com')
      );
    });
  });

  describe('Props change reset', () => {
    it('should reset error when resetKeys change', () => {
      const { rerender } = render(
        <ErrorBoundary resetOnPropsChange resetKeys={['key1']}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component Error')).toBeInTheDocument();

      // Change resetKeys to trigger reset
      rerender(
        <ErrorBoundary resetOnPropsChange resetKeys={['key2']}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Event ID display', () => {
    it('should display event ID when available', () => {
      // Mock Sentry to return event ID
      const mockSentry = {
        captureException: jest.fn().mockReturnValue('test-event-id'),
      };
      Object.defineProperty(window, 'Sentry', {
        value: mockSentry,
        writable: true,
      });

      render(
        <ErrorBoundary level='page'>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('test-event-id')).toBeInTheDocument();
      expect(
        screen.getByText('Reference this ID when reporting the issue.')
      ).toBeInTheDocument();
    });
  });

  describe('Error boundary integration', () => {
    it('should handle multiple error boundaries', () => {
      render(
        <ErrorBoundary level='page'>
          <div>
            <ErrorBoundary level='component'>
              <ThrowError />
            </ErrorBoundary>
            <div>Other content</div>
          </div>
        </ErrorBoundary>
      );

      // Only the inner component error boundary should catch the error
      expect(screen.getByText('Component Error')).toBeInTheDocument();
      expect(screen.getByText('Other content')).toBeInTheDocument();
      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });
  });
});
