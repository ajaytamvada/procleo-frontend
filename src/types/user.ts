/**
 * User Management Types
 * Defines types for user entities, roles, and related operations
 */

import type { BaseEntity } from './index';

// ========================================
// User Role Types
// ========================================

export type UserRole = 
  | 'SUPER_USER'
  | 'VENDOR'
  | 'MANAGER'
  | 'HEAD'
  | 'BUYER';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
  screens: string[];
}

export type Permission =
  // User Management
  | 'CREATE_USER'
  | 'READ_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'MANAGE_ROLES'
  
  // Purchase Management
  | 'CREATE_PURCHASE_ORDER'
  | 'READ_PURCHASE_ORDER'
  | 'UPDATE_PURCHASE_ORDER'
  | 'DELETE_PURCHASE_ORDER'
  | 'APPROVE_PURCHASE_ORDER'
  | 'REJECT_PURCHASE_ORDER'
  
  // Vendor Management
  | 'CREATE_VENDOR'
  | 'READ_VENDOR'
  | 'UPDATE_VENDOR'
  | 'DELETE_VENDOR'
  | 'APPROVE_VENDOR'
  
  // Asset Management
  | 'CREATE_ASSET'
  | 'READ_ASSET'
  | 'UPDATE_ASSET'
  | 'DELETE_ASSET'
  | 'TRANSFER_ASSET'
  
  // Inventory Management
  | 'CREATE_INVENTORY'
  | 'READ_INVENTORY'
  | 'UPDATE_INVENTORY'
  | 'DELETE_INVENTORY'
  
  // Reports & Analytics
  | 'VIEW_REPORTS'
  | 'EXPORT_REPORTS'
  | 'VIEW_ANALYTICS'
  
  // System Administration
  | 'SYSTEM_CONFIG'
  | 'AUDIT_LOGS'
  | 'BACKUP_RESTORE'
  | 'USER_ACTIVITY_LOGS';

// ========================================
// User Entity Types
// ========================================

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  phoneNumber?: string;
  role: UserRole;
  departmentId?: number;
  departmentName?: string;
  companyId?: number;
  companyName?: string;
  designation?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  emailVerified: boolean;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  passwordLastChangedAt: string;
  profilePicture?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  headUserId?: number;
  parentDepartmentId?: number;
  active: boolean;
}

// ========================================
// Form Types
// ========================================

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  employeeId?: string;
  phoneNumber?: string;
  departmentId?: number;
  designation?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  employeeId?: string;
  phoneNumber?: string;
  departmentId?: number;
  designation?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ========================================
// API Response Types
// ========================================

export interface UserListResponse {
  users: User[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  status?: string;
  departmentId?: number;
  page?: number;
  size?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'lastLoginAt';
  sortDirection?: 'ASC' | 'DESC';
}

// ========================================
// Role Configuration
// ========================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_USER: {
    role: 'SUPER_USER',
    description: 'Full system access with all permissions',
    permissions: [
      'CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'MANAGE_ROLES',
      'CREATE_PURCHASE_ORDER', 'READ_PURCHASE_ORDER', 'UPDATE_PURCHASE_ORDER', 'DELETE_PURCHASE_ORDER', 'APPROVE_PURCHASE_ORDER', 'REJECT_PURCHASE_ORDER',
      'CREATE_VENDOR', 'READ_VENDOR', 'UPDATE_VENDOR', 'DELETE_VENDOR', 'APPROVE_VENDOR',
      'CREATE_ASSET', 'READ_ASSET', 'UPDATE_ASSET', 'DELETE_ASSET', 'TRANSFER_ASSET',
      'CREATE_INVENTORY', 'READ_INVENTORY', 'UPDATE_INVENTORY', 'DELETE_INVENTORY',
      'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_ANALYTICS',
      'SYSTEM_CONFIG', 'AUDIT_LOGS', 'BACKUP_RESTORE', 'USER_ACTIVITY_LOGS'
    ],
    screens: ['dashboard', 'users', 'purchases', 'vendors', 'assets', 'inventory', 'reports', 'settings', 'audit']
  },
  VENDOR: {
    role: 'VENDOR',
    description: 'External vendor access with limited permissions',
    permissions: [
      'READ_PURCHASE_ORDER', 'UPDATE_PURCHASE_ORDER',
      'READ_VENDOR', 'UPDATE_VENDOR'
    ],
    screens: ['vendor-dashboard', 'purchase-orders', 'vendor-profile']
  },
  MANAGER: {
    role: 'MANAGER',
    description: 'Department manager with approval permissions',
    permissions: [
      'READ_USER', 'UPDATE_USER',
      'CREATE_PURCHASE_ORDER', 'READ_PURCHASE_ORDER', 'UPDATE_PURCHASE_ORDER', 'APPROVE_PURCHASE_ORDER', 'REJECT_PURCHASE_ORDER',
      'READ_VENDOR', 'UPDATE_VENDOR', 'APPROVE_VENDOR',
      'READ_ASSET', 'UPDATE_ASSET', 'TRANSFER_ASSET',
      'READ_INVENTORY', 'UPDATE_INVENTORY',
      'VIEW_REPORTS', 'EXPORT_REPORTS'
    ],
    screens: ['dashboard', 'purchases', 'vendors', 'assets', 'inventory', 'reports']
  },
  HEAD: {
    role: 'HEAD',
    description: 'Department head with extended permissions',
    permissions: [
      'CREATE_USER', 'READ_USER', 'UPDATE_USER',
      'CREATE_PURCHASE_ORDER', 'READ_PURCHASE_ORDER', 'UPDATE_PURCHASE_ORDER', 'APPROVE_PURCHASE_ORDER', 'REJECT_PURCHASE_ORDER',
      'CREATE_VENDOR', 'READ_VENDOR', 'UPDATE_VENDOR', 'APPROVE_VENDOR',
      'CREATE_ASSET', 'READ_ASSET', 'UPDATE_ASSET', 'TRANSFER_ASSET',
      'CREATE_INVENTORY', 'READ_INVENTORY', 'UPDATE_INVENTORY',
      'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_ANALYTICS'
    ],
    screens: ['dashboard', 'users', 'purchases', 'vendors', 'assets', 'inventory', 'reports']
  },
  BUYER: {
    role: 'BUYER',
    description: 'Procurement buyer with purchase creation permissions',
    permissions: [
      'CREATE_PURCHASE_ORDER', 'READ_PURCHASE_ORDER', 'UPDATE_PURCHASE_ORDER',
      'READ_VENDOR', 'UPDATE_VENDOR',
      'READ_ASSET', 'UPDATE_ASSET',
      'READ_INVENTORY', 'UPDATE_INVENTORY',
      'VIEW_REPORTS'
    ],
    screens: ['dashboard', 'purchases', 'vendors', 'assets', 'inventory', 'reports']
  }
};

// ========================================
// Utility Types
// ========================================

export interface UserFormData extends CreateUserRequest {}

export interface UserTableData {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  status: string;
  lastLogin: string;
}