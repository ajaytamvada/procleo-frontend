/**
 * Global TypeScript type definitions for the Autovitica P2P Frontend Application
 * 
 * This file contains shared types used across the application.
 * Feature-specific types should be defined in their respective feature directories.
 */

// ========================================
// API Response Types
// ========================================

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  _links: {
    self: { href: string };
    next?: { href: string };
    prev?: { href: string };
    first: { href: string };
    last: { href: string };
  };
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  errorCode: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string[]>;
}

// ========================================
// Common Entity Types
// ========================================

export interface BaseEntity {
  id: number;
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditableEntity extends BaseEntity {
  active: boolean;
  deleted: boolean;
}

// ========================================
// User and Authentication Types
// ========================================

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  designation?: string;
  departmentId?: number;
  departmentName?: string;
  companyId?: number;
  companyName?: string;
  roles: string[];
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedAt?: string;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// ========================================
// Permission and Role Types
// ========================================

export type Permission = 
  | 'READ_USERS'
  | 'WRITE_USERS'
  | 'DELETE_USERS'
  | 'READ_PURCHASES'
  | 'WRITE_PURCHASES'
  | 'APPROVE_PURCHASES'
  | 'READ_ASSETS'
  | 'WRITE_ASSETS'
  | 'TRANSFER_ASSETS'
  | 'READ_VENDORS'
  | 'WRITE_VENDORS'
  | 'READ_REPORTS'
  | 'ADMIN_ACCESS';

export type UserRole = 'USER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

// ========================================
// Form and Input Types
// ========================================

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: any; // Zod schema
}

// ========================================
// Search and Filter Types
// ========================================

export interface SearchCriteria {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
  options?: SelectOption[];
  defaultValue?: any;
}

// ========================================
// UI and Component Types
// ========================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  formatter?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ActionButton {
  label: string;
  icon?: React.ComponentType;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  permission?: Permission;
}

// ========================================
// Notification Types
// ========================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
}

// ========================================
// Theme and Styling Types
// ========================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
}

// ========================================
// Navigation Types
// ========================================

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  href?: string;
  children?: NavigationItem[];
  permission?: Permission;
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
}

// ========================================
// Application State Types
// ========================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  pageSize: number;
  autoSave: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// ========================================
// Utility Types
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ID = string | number;

export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject';