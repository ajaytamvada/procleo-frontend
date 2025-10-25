import { useMemo } from 'react';
import type { UserRole, Permission } from '@/types/user';
import { ROLE_PERMISSIONS } from '@/types/user';

interface UsePermissionsProps {
  userRole: UserRole;
}

interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  permissions: Permission[];
  allowedScreens: string[];
  canAccessScreen: (screenName: string) => boolean;
}

export const usePermissions = ({ userRole }: UsePermissionsProps): UsePermissionsReturn => {
  const roleConfig = useMemo(() => ROLE_PERMISSIONS[userRole], [userRole]);

  const hasPermission = (permission: Permission): boolean => {
    return roleConfig.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canAccessScreen = (screenName: string): boolean => {
    return roleConfig.screens.includes(screenName);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: roleConfig.permissions,
    allowedScreens: roleConfig.screens,
    canAccessScreen,
  };
};