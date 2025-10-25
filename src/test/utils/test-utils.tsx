/**
 * Custom testing utilities that wrap React Testing Library
 * 
 * This module provides enhanced testing utilities with common providers
 * and mock setups for testing React components in the Autovitica P2P application.
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import type { User } from '@/types';

// ========================================
// Mock Providers and Context
// ========================================

// Mock Auth Context
interface MockAuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const MockAuthContext = React.createContext<MockAuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {},
  logout: () => {},
  refreshToken: async () => {},
});

// Mock Theme Context
interface MockThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const MockThemeContext = React.createContext<MockThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

// Mock Notification Context
interface MockNotificationContextValue {
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const MockNotificationContext = React.createContext<MockNotificationContextValue>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
});

// ========================================
// Test Wrapper Components
// ========================================

interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialUser?: User | null;
  theme?: 'light' | 'dark';
  initialRoute?: string;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  queryClient,
  initialUser = null,
  theme = 'light',
  initialRoute = '/',
}) => {
  // Create a new QueryClient for each test to avoid test pollution
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const mockAuthValue: MockAuthContextValue = {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
    login: async () => {},
    logout: () => {},
    refreshToken: async () => {},
  };

  const mockThemeValue: MockThemeContextValue = {
    theme,
    toggleTheme: () => {},
    setTheme: () => {},
  };

  const mockNotificationValue: MockNotificationContextValue = {
    notifications: [],
    addNotification: () => {},
    removeNotification: () => {},
    clearNotifications: () => {},
  };

  // Set initial route if specified
  if (initialRoute !== '/' && window.location.pathname !== initialRoute) {
    window.history.pushState({}, '', initialRoute);
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        <MockAuthContext.Provider value={mockAuthValue}>
          <MockThemeContext.Provider value={mockThemeValue}>
            <MockNotificationContext.Provider value={mockNotificationValue}>
              {children}
            </MockNotificationContext.Provider>
          </MockThemeContext.Provider>
        </MockAuthContext.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// ========================================
// Enhanced Render Function
// ========================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialUser?: User | null;
  theme?: 'light' | 'dark';
  initialRoute?: string;
  wrapper?: React.ComponentType<any>;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    queryClient,
    initialUser,
    theme,
    initialRoute,
    wrapper,
    ...renderOptions
  } = options;

  const Wrapper = wrapper || AllTheProviders;

  return render(ui, {
    wrapper: (props) => (
      <Wrapper
        {...props}
        queryClient={queryClient}
        initialUser={initialUser}
        theme={theme}
        initialRoute={initialRoute}
      />
    ),
    ...renderOptions,
  });
};

// ========================================
// Mock Hooks
// ========================================

// Mock useAuth hook
export const createMockUseAuth = (overrides: Partial<MockAuthContextValue> = {}) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn(),
    refreshToken: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
};

// Mock useQuery hook
export const createMockUseQuery = (data: any, overrides: any = {}) => {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
};

// Mock useMutation hook
export const createMockUseMutation = (overrides: any = {}) => {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
    isError: false,
    error: null,
    data: null,
    reset: jest.fn(),
    ...overrides,
  };
};

// ========================================
// Test Data Factories
// ========================================

export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  employeeId: 'EMP001',
  designation: 'Software Engineer',
  departmentId: 1,
  departmentName: 'Information Technology',
  companyId: 1,
  companyName: 'Autovitica Solutions',
  roles: ['USER'],
  enabled: true,
  accountNonExpired: true,
  accountNonLocked: true,
  credentialsNonExpired: true,
  lastLoginAt: new Date().toISOString(),
  failedLoginAttempts: 0,
  emailVerified: true,
  version: 1,
  createdAt: new Date().toISOString(),
  createdBy: 'system',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
  ...overrides,
});

export const createTestPurchaseOrder = (overrides: any = {}) => ({
  id: 1,
  purchaseOrderNumber: 'PO/23-24/001',
  purchaseOrderDate: '2024-01-15',
  expectedDeliveryDate: '2024-02-15',
  quotationNumber: 'QT/23-24/001',
  quotationId: 1,
  indentNumber: 'IND/23-24/001',
  purchaseOrderType: 'Regular',
  status: 'Draft',
  approvalStatus: 'Pending',
  vendorId: 1,
  vendorName: 'Test Vendor',
  vendorCode: 'VEN001',
  subTotal: 100000,
  taxAmount: 18000,
  totalAmount: 118000,
  paymentTerms: '30 days from delivery',
  incoterms: 'FOB',
  remarks: 'Test purchase order',
  items: [],
  createdAt: new Date().toISOString(),
  createdBy: 'testuser',
  updatedAt: new Date().toISOString(),
  updatedBy: 'testuser',
  ...overrides,
});

export const createTestAsset = (overrides: any = {}) => ({
  id: 1,
  assetTag: 'AST/IT/LAP-0001',
  serialNumber: 'SN123456789',
  productName: 'Dell Latitude 7420',
  productCode: 'DL7420',
  manufacturer: 'Dell Technologies',
  categoryId: 1,
  categoryName: 'IT Equipment',
  subCategoryId: 5,
  subCategoryName: 'Laptops',
  assetType: 'IT',
  status: 'In Store',
  purchasePrice: 45000,
  currentValue: 40000,
  locationId: 1,
  locationName: 'Bangalore Office',
  departmentId: 1,
  departmentName: 'Information Technology',
  assignedTo: null,
  assignedDate: null,
  warrantyExpiry: '2027-01-15',
  createdAt: new Date().toISOString(),
  createdBy: 'testuser',
  updatedAt: new Date().toISOString(),
  updatedBy: 'testuser',
  ...overrides,
});

export const createTestVendor = (overrides: any = {}) => ({
  id: 1,
  vendorName: 'Test Vendor Ltd',
  vendorCode: 'VEN001',
  contactPerson: 'John Vendor',
  email: 'contact@testvendor.com',
  phone: '+1234567890',
  address1: '123 Business Street',
  address2: 'Business District',
  city: 'Test City',
  state: 'Test State',
  country: 'Test Country',
  status: 'Active',
  registrationDate: '2024-01-01',
  createdAt: new Date().toISOString(),
  createdBy: 'testuser',
  updatedAt: new Date().toISOString(),
  updatedBy: 'testuser',
  ...overrides,
});

// ========================================
// Event Helpers
// ========================================

export const createMockEvent = (type: string, overrides: any = {}) => ({
  type,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    value: '',
    name: '',
    checked: false,
    ...overrides.target,
  },
  currentTarget: {
    value: '',
    name: '',
    checked: false,
    ...overrides.currentTarget,
  },
  ...overrides,
});

export const createMockFileEvent = (files: File[]) => ({
  type: 'change',
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    files,
    value: '',
  },
  currentTarget: {
    files,
    value: '',
  },
});

// ========================================
// Async Helpers
// ========================================

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForTimeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ========================================
// Query Client Helpers
// ========================================

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// ========================================
// Assertion Helpers
// ========================================

export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  expect(element).toHaveClass(className);
};

export const expectToHaveAttribute = (element: HTMLElement | null, attribute: string, value?: string) => {
  if (value !== undefined) {
    expect(element).toHaveAttribute(attribute, value);
  } else {
    expect(element).toHaveAttribute(attribute);
  }
};

export const expectToBeDisabled = (element: HTMLElement | null) => {
  expect(element).toBeDisabled();
};

export const expectToBeEnabled = (element: HTMLElement | null) => {
  expect(element).toBeEnabled();
};

// ========================================
// Re-export everything from React Testing Library
// ========================================

export * from '@testing-library/react';
export { customRender as render };

// ========================================
// Global Test Utilities Export
// ========================================

export const testUtils = {
  createTestUser,
  createTestPurchaseOrder,
  createTestAsset,
  createTestVendor,
  createMockEvent,
  createMockFileEvent,
  createMockUseAuth,
  createMockUseQuery,
  createMockUseMutation,
  createTestQueryClient,
  waitForNextTick,
  waitForTimeout,
  expectToBeInDocument,
  expectToHaveClass,
  expectToHaveAttribute,
  expectToBeDisabled,
  expectToBeEnabled,
};