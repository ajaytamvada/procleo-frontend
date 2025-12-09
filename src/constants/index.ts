/**
 * Application-wide constants and configuration values
 */

// ========================================
// API Configuration
// ========================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    REGISTER: '/api/v1/auth/register',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
  },
  USERS: {
    BASE: '/api/v1/users',
    PROFILE: '/api/v1/users/profile',
    STATISTICS: '/api/v1/users/statistics',
    SEARCH: '/api/v1/users/search',
  },
  PURCHASES: {
    BASE: '/api/v1/purchases',
    ORDERS: '/api/v1/purchases/orders',
    STATISTICS: '/api/v1/purchases/statistics',
    APPROVALS: '/api/v1/purchases/approvals',
    QUOTATIONS: '/api/v1/purchases/quotations',
  },
  ASSETS: {
    BASE: '/api/v1/assets',
    REGISTER: '/api/v1/assets/register',
    TRANSFER: '/api/v1/assets/transfer',
    MAINTENANCE: '/api/v1/assets/maintenance',
    VERIFICATION: '/api/v1/assets/verification',
    DISPOSAL: '/api/v1/assets/disposal',
    STATISTICS: '/api/v1/assets/statistics',
  },
  VENDORS: {
    BASE: '/api/v1/vendors',
    REGISTER: '/api/v1/vendors/register',
    SELECTION: '/api/v1/vendors/selection',
    PERFORMANCE: '/api/v1/vendors/performance',
  },
  REPORTS: {
    BASE: '/api/v1/reports',
    DASHBOARD: '/api/v1/reports/dashboard',
    EXPORT: '/api/v1/reports/export',
  },
} as const;

// ========================================
// Application Routes
// ========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',

  // User Management
  USERS: '/users',
  USER_PROFILE: '/profile',
  USER_SETTINGS: '/settings',

  // Purchase Management
  PURCHASES: '/purchases',
  PURCHASE_ORDERS: '/purchases/orders',
  PURCHASE_CREATE: '/purchases/create',
  PURCHASE_APPROVALS: '/purchases/approvals',
  QUOTATIONS: '/purchases/quotations',

  // Asset Management
  ASSETS: '/assets',
  ASSET_REGISTER: '/assets/register',
  ASSET_TRANSFER: '/assets/transfer',
  ASSET_MAINTENANCE: '/assets/maintenance',
  ASSET_VERIFICATION: '/assets/verification',
  ASSET_DISPOSAL: '/assets/disposal',

  // Vendor Management
  VENDORS: '/vendors',
  VENDOR_REGISTER: '/vendors/register',
  VENDOR_SELECTION: '/vendors/selection',
  VENDOR_PERFORMANCE: '/vendors/performance',

  // Reports
  REPORTS: '/reports',
  REPORTS_DASHBOARD: '/reports/dashboard',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT: '/admin/audit',
} as const;

// ========================================
// UI Constants
// ========================================

export const UI_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 200,
  ANIMATION_DURATION: 200,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  LOADING: 1090,
} as const;

// ========================================
// Form Validation Constants
// ========================================

export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9._-]+$/,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s-()]+$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
} as const;

// ========================================
// Date and Time Constants
// ========================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
  API: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

export const TIME_ZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
] as const;

// ========================================
// Status Constants
// ========================================

export const STATUSES = {
  PURCHASE_ORDER: {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    IN_PROCESS: 'In Process',
    DELIVERED: 'Delivered',
    PARTIALLY_DELIVERED: 'Partially Delivered',
  },
  ASSET: {
    IN_STORE: 'In Store',
    ALLOCATED: 'Allocated',
    IN_USE: 'In Use',
    UNDER_MAINTENANCE: 'Under Maintenance',
    DAMAGED: 'Damaged',
    DISPOSED: 'Disposed',
    TRANSFERRED: 'Transferred',
  },
  USER: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
    SUSPENDED: 'Suspended',
    LOCKED: 'Locked',
  },
  VENDOR: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    BLACKLISTED: 'Blacklisted',
    PENDING_APPROVAL: 'Pending Approval',
  },
} as const;

// ========================================
// Permission Constants
// ========================================

export const PERMISSIONS = {
  // User Management
  READ_USERS: 'READ_USERS',
  WRITE_USERS: 'WRITE_USERS',
  DELETE_USERS: 'DELETE_USERS',

  // Purchase Management
  READ_PURCHASES: 'READ_PURCHASES',
  WRITE_PURCHASES: 'WRITE_PURCHASES',
  APPROVE_PURCHASES: 'APPROVE_PURCHASES',

  // Asset Management
  READ_ASSETS: 'READ_ASSETS',
  WRITE_ASSETS: 'WRITE_ASSETS',
  TRANSFER_ASSETS: 'TRANSFER_ASSETS',

  // Vendor Management
  READ_VENDORS: 'READ_VENDORS',
  WRITE_VENDORS: 'WRITE_VENDORS',

  // Reports
  READ_REPORTS: 'READ_REPORTS',

  // Admin
  ADMIN_ACCESS: 'ADMIN_ACCESS',
} as const;

export const ROLES = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

// ========================================
// File Upload Constants
// ========================================

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    SPREADSHEET: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
  },
  UPLOAD_CHUNK_SIZE: 1024 * 1024, // 1MB chunks
} as const;

// ========================================
// Storage Keys
// ========================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'autovitica_access_token',
  REFRESH_TOKEN: 'autovitica_refresh_token',
  USER_PREFERENCES: 'autovitica_user_preferences',
  THEME: 'autovitica_theme',
  LANGUAGE: 'autovitica_language',
  SIDEBAR_COLLAPSED: 'autovitica_sidebar_collapsed',
  RECENT_SEARCHES: 'autovitica_recent_searches',
  DRAFT_FORMS: 'autovitica_draft_forms',
} as const;

// ========================================
// Error Messages
// ========================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN:
    'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE:
    'Invalid file type. Please select a supported file format.',
} as const;

// ========================================
// Success Messages
// ========================================

export const SUCCESS_MESSAGES = {
  SAVE: 'Data saved successfully.',
  UPDATE: 'Data updated successfully.',
  DELETE: 'Data deleted successfully.',
  UPLOAD: 'File uploaded successfully.',
  EXPORT: 'Data exported successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  PASSWORD_RESET: 'Password reset successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const;

// ========================================
// Feature Flags
// ========================================

export const FEATURE_FLAGS = {
  ADVANCED_SEARCH: import.meta.env.VITE_FEATURE_ADVANCED_SEARCH === 'true',
  DARK_MODE: import.meta.env.VITE_FEATURE_DARK_MODE !== 'false',
  ANALYTICS: import.meta.env.VITE_FEATURE_ANALYTICS === 'true',
  NOTIFICATIONS: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false',
  REAL_TIME_UPDATES: import.meta.env.VITE_FEATURE_REAL_TIME === 'true',
  BULK_OPERATIONS: import.meta.env.VITE_FEATURE_BULK_OPS === 'true',
  EXPORT_FUNCTIONALITY: import.meta.env.VITE_FEATURE_EXPORT !== 'false',
} as const;
