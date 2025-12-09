import React from 'react';
import type { Permission, UserRole } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Permission Gate Component
 *
 * Controls visibility of UI elements based on user permissions.
 * Uses legacy permission system for backward compatibility.
 *
 * @example
 * ```tsx
 * <PermissionGate requiredPermission="CREATE_PURCHASE_ORDER">
 *   <CreateButton />
 * </PermissionGate>
 * ```
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  allowedRoles = [],
  fallback = null,
}) => {
  const { hasPermission, hasRole } = useAuth();

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasPermission(permission))
      : requiredPermissions.some(permission => hasPermission(permission));

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGate;
