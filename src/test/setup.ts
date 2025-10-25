/**
 * Jest test setup file
 * 
 * This file is run before each test file and sets up the testing environment
 * with necessary polyfills, mocks, and global configurations.
 */

import '@testing-library/jest-dom';

import { cleanup } from '@testing-library/react';

// ========================================
// Global Test Setup
// ========================================

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Setup before all tests
beforeAll(() => {
  // Mock environment variables for tests
  Object.defineProperty(import.meta, 'env', {
    value: {
      MODE: 'test',
      DEV: false,
      PROD: false,
      VITE_APP_NAME: 'Autovitica P2P Test',
      VITE_APP_VERSION: '1.0.0-test',
      VITE_API_BASE_URL: 'http://localhost:8080',
      VITE_API_TIMEOUT: '30000',
      VITE_API_RETRY_ATTEMPTS: '3',
      VITE_FEATURE_ADVANCED_SEARCH: 'true',
      VITE_FEATURE_DARK_MODE: 'true',
      VITE_FEATURE_ANALYTICS: 'false',
      VITE_FEATURE_NOTIFICATIONS: 'true',
      VITE_FEATURE_REAL_TIME: 'false',
      VITE_FEATURE_BULK_OPS: 'true',
      VITE_FEATURE_EXPORT: 'true',
      VITE_DEFAULT_PAGE_SIZE: '20',
      VITE_MAX_PAGE_SIZE: '100',
      VITE_TOAST_DURATION: '5000',
      VITE_MAX_FILE_SIZE: '10485760',
      VITE_ALLOWED_FILE_TYPES: 'image/jpeg,image/png,application/pdf',
      VITE_ENABLE_DEVTOOLS: 'false',
      VITE_LOG_LEVEL: 'error',
      VITE_DEBUG_MODE: 'false',
      VITE_SENTRY_ENVIRONMENT: 'test',
    },
    writable: true,
  });
});

// Setup before each test
beforeEach(() => {
  // Reset any runtime caches or states
  if (global.localStorage) {
    global.localStorage.clear();
  }
  if (global.sessionStorage) {
    global.sessionStorage.clear();
  }
});

// ========================================
// DOM and Browser API Mocks
// ========================================

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.resizeTo
Object.defineProperty(window, 'resizeTo', {
  writable: true,
  value: jest.fn(),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// ========================================
// File and Clipboard API Mocks
// ========================================

// Mock File constructor
global.File = class MockFile {
  constructor(
    bits: BlobPart[],
    name: string,
    options?: FilePropertyBag
  ) {}
  
  get size() { return 1024; }
  get type() { return (this as any).options?.type || 'text/plain'; }
  get lastModified() { return Date.now(); }
} as any;

// Mock FileReader
global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: 0 | 1 | 2 = 0;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();

  // Required FileReader constants
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
  readonly EMPTY = 0;
  readonly LOADING = 1;
  readonly DONE = 2;

  readAsText(file: Blob) {
    this.result = 'mock file content';
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  readAsDataURL(file: Blob) {
    this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  readAsArrayBuffer(file: Blob) {
    this.result = new ArrayBuffer(8);
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  readAsBinaryString(file: Blob) {
    this.result = 'binary string content';
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }

  abort() {
    if (this.onabort) {
      this.onabort({} as ProgressEvent<FileReader>);
    }
  }
} as any;

// Mock Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
    write: jest.fn().mockResolvedValue(undefined),
    read: jest.fn().mockResolvedValue([]),
  },
  writable: true,
});

// ========================================
// Storage Mocks
// ========================================

// Create a more complete localStorage mock
const createStorageMock = () => {
  let store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
  writable: true,
});

// ========================================
// Network and API Mocks
// ========================================

// Mock fetch for tests that don't use MSW
global.fetch = jest.fn();

// Mock XMLHttpRequest with constants
const MockXMLHttpRequest = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  abort: jest.fn(),
  status: 200,
  statusText: 'OK',
  response: '',
  responseText: '',
  responseType: '',
  responseURL: '',
  responseXML: null,
  readyState: 4,
  timeout: 0,
  upload: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Add static constants
(MockXMLHttpRequest as any).UNSENT = 0;
(MockXMLHttpRequest as any).OPENED = 1;
(MockXMLHttpRequest as any).HEADERS_RECEIVED = 2;
(MockXMLHttpRequest as any).LOADING = 3;
(MockXMLHttpRequest as any).DONE = 4;

global.XMLHttpRequest = MockXMLHttpRequest as any;

// ========================================
// Console Utilities
// ========================================

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error;
console.error = (...args: any[]) => {
  // Allow React Testing Library errors to show
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  
  // Allow console.error in tests that expect errors
  if (expect.getState().currentTestName?.includes('error')) {
    originalError(...args);
  }
};

// ========================================
// Utility Functions for Tests
// ========================================

// Global test utilities
(global as any).testUtils = {
  // Create a mock user for authentication tests
  createMockUser: (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['USER'],
    enabled: true,
    accountNonExpired: true,
    accountNonLocked: true,
    credentialsNonExpired: true,
    ...overrides,
  }),

  // Create mock API response
  createMockApiResponse: (data: any, overrides = {}) => ({
    data,
    message: 'Success',
    success: true,
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  // Create mock paginated response
  createMockPaginatedResponse: (items: any[], page = 0, size = 20, total?: number) => ({
    content: items,
    page: {
      size,
      number: page,
      totalElements: total ?? items.length,
      totalPages: Math.ceil((total ?? items.length) / size),
    },
    _links: {
      self: { href: `/api/v1/test?page=${page}&size=${size}` },
      first: { href: `/api/v1/test?page=0&size=${size}` },
      last: { href: `/api/v1/test?page=${Math.ceil((total ?? items.length) / size) - 1}&size=${size}` },
    },
  }),

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock timer helpers
  advanceTimers: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },

  // Mock file for file upload tests
  createMockFile: (name = 'test.txt', type = 'text/plain', content = 'test content') => {
    return new File([content], name, { type });
  },
};

// ========================================
// Type Declarations
// ========================================

declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockUser: (overrides?: any) => any;
        createMockApiResponse: (data: any, overrides?: any) => any;
        createMockPaginatedResponse: (items: any[], page?: number, size?: number, total?: number) => any;
        waitFor: (ms: number) => Promise<void>;
        advanceTimers: (ms: number) => void;
        createMockFile: (name?: string, type?: string, content?: string) => File;
      };
    }
  }

  const testUtils: {
    createMockUser: (overrides?: any) => any;
    createMockApiResponse: (data: any, overrides?: any) => any;
    createMockPaginatedResponse: (items: any[], page?: number, size?: number, total?: number) => any;
    waitFor: (ms: number) => Promise<void>;
    advanceTimers: (ms: number) => void;
    createMockFile: (name?: string, type?: string, content?: string) => File;
  };
}