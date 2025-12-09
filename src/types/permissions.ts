/**
 * Permission-related types and interfaces for dynamic module-based access control
 */

export type ModuleType = 'MENU' | 'SUBMENU' | 'ACTION' | 'BUTTON';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export';

/**
 * Represents a user's permission for a specific module
 */
export interface UserModulePermission {
  moduleCode: string;
  moduleName: string;
  parentModuleCode?: string;
  routePath?: string;
  iconName?: string;
  sortOrder: number;
  moduleType: ModuleType;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

/**
 * Module definition (for admin management)
 */
export interface Module {
  id: number;
  moduleCode: string;
  moduleName: string;
  parentModuleCode?: string;
  routePath?: string;
  iconName?: string;
  sortOrder: number;
  isActive: boolean;
  moduleType: ModuleType;
  description?: string;
  children?: Module[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User type module permission (for admin management)
 */
export interface UserTypeModulePermission {
  id: number;
  userTypeId: number;
  userTypeName?: string;
  moduleCode: string;
  moduleName?: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request payload for assigning/updating permissions
 */
export interface ModulePermissionRequest {
  userTypeId: number;
  moduleCode: string;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canExport?: boolean;
}

/**
 * Navigation item structure for sidebar
 */
export interface NavigationItem {
  moduleCode: string;
  name: string;
  href: string;
  icon?: string;
  subItems?: NavigationItem[];
  permissions?: UserModulePermission;
}
